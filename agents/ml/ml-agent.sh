#!/usr/bin/env bash
# Unified Ml Agent - Multi-Persona via CLI Tools
#
# Uses CLI tools (claude, codex, gemini, opencode) instead of direct API calls
# Behavior determined by symlink name:
#   ml-claude.sh → claude CLI (Threat Modeler)
#   ml-codex.sh → codex CLI (Vulnerability Scanner)
#   ml-gemini.sh → gemini CLI (Penetration Tester)
#   ml-opencode.sh → opencode CLI (Remediator)

set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "$0")" && pwd)"
AGENT_MD="$AGENT_ROOT/ml-agent.md"

# Detect persona from script name
SCRIPT_NAME=$(basename "$0")
PERSONA=""
CLI_TOOL=""

case "$SCRIPT_NAME" in
    ml-claude.sh)
        PERSONA="claude"
        CLI_TOOL="claude"
        ;;
    ml-codex.sh)
        PERSONA="codex"
        CLI_TOOL="codex"
        ;;
    ml-gemini.sh)
        PERSONA="gemini"
        CLI_TOOL="gemini"
        ;;
    ml-opencode.sh)
        PERSONA="opencode"
        CLI_TOOL="opencode"
        ;;
    ml-agent.sh)
        # Direct invocation - require persona in input
        INPUT_PEEK=$(cat)
        PERSONA=$(echo "$INPUT_PEEK" | jq -r '.persona // "claude"')

        case "$PERSONA" in
            claude) CLI_TOOL="claude" ;;
            codex) CLI_TOOL="codex" ;;
            gemini) CLI_TOOL="gemini" ;;
            opencode) CLI_TOOL="opencode" ;;
        esac

        echo "$INPUT_PEEK"  # Pass through for later reading
        ;;
    *)
        echo "Error: Unknown script name '$SCRIPT_NAME'" >&2
        echo "Expected: ml-claude.sh, ml-codex.sh, ml-gemini.sh, or ml-opencode.sh" >&2
        exit 1
        ;;
esac

# Check if CLI tool is available
if ! command -v "$CLI_TOOL" &> /dev/null; then
    echo "Error: CLI tool '$CLI_TOOL' not found in PATH" >&2
    echo "Please install and configure: $CLI_TOOL login" >&2
    exit 1
fi

# Read input
INPUT=$(cat)
ROLE=$(echo "$INPUT" | jq -r '.role // "formulate"')

# Extract prompt from md file for this persona+role
extract_prompt() {
    local persona="$1"
    local role="$2"
    local role_upper=$(echo "$role" | tr '[:lower:]' '[:upper:]')

    awk -v persona="$persona" -v role="$role" -v role_upper="$role_upper" '
    BEGIN {
        in_role_section = 0
        in_persona_section = 0
        in_prompt = 0
        prompt = ""
    }

    /^## / {
        if ($0 ~ role_upper " ROLE") {
            in_role_section = 1
            in_persona_section = 0
            in_prompt = 0
        } else if (!in_prompt && $0 ~ / ROLE$/) {
            in_role_section = 0
            in_persona_section = 0
            in_prompt = 0
        }
        if (!in_prompt) next
    }

    /^### Persona: ml-/ {
        if (in_role_section && $0 ~ "ml-" persona) {
            in_persona_section = 1
        } else {
            in_persona_section = 0
            in_prompt = 0
        }
        next
    }

    /^#### System Prompt/ {
        if (in_persona_section) {
            in_prompt = 1
        }
        next
    }

    /^---$/ {
        if (in_prompt) {
            print prompt
            exit
        }
        next
    }

    {
        if (in_prompt) {
            if (prompt != "") prompt = prompt "\n"
            prompt = prompt $0
        }
    }

    END {
        if (prompt != "") print prompt
    }
    ' "$AGENT_MD"
}

PROMPT=$(extract_prompt "$PERSONA" "$ROLE")

if [ -z "$PROMPT" ]; then
    echo "Error: Could not find persona '$PERSONA' role '$ROLE' in $AGENT_MD" >&2
    exit 1
fi

# Read input from stdin (already read above)
# INPUT variable already set

# Build full prompt with input context
FULL_PROMPT="$PROMPT

## Input

$INPUT

## Instructions

Respond in the exact format specified in your persona definition."

# Extract task metadata from input if available
TASK_ID=$(echo "$INPUT" | jq -r '.task_id // .id // ""')
TASK_TYPE=$(echo "$INPUT" | jq -r '.task_type // .type // ""')

# Determine agent logger path
ROOT_DIR="$(dirname "$AGENT_ROOT")"
AGENT_LOGGER="$ROOT_DIR/bin/agent-logger.sh"

# Check if agent-logger exists
if [[ -f "$AGENT_LOGGER" ]]; then
    # Use comprehensive logging via agent-logger
    echo "$FULL_PROMPT" | "$AGENT_LOGGER" \
        --agent "ml-agent" \
        --persona "ml-$PERSONA" \
        --cli "$CLI_TOOL" \
        --task "$TASK_ID" \
        --task-type "$TASK_TYPE" \
        --session "${AGENT_SESSION_ID:-}"
else
    # Fallback: direct CLI call without logging
    echo "Warning: agent-logger.sh not found at $AGENT_LOGGER - using direct CLI call" >&2

    case "$CLI_TOOL" in
        claude)
            echo "$FULL_PROMPT" | claude exec 2>/dev/null || {
                echo "Error: Failed to call claude CLI" >&2
                exit 1
            }
            ;;
        codex)
            echo "$FULL_PROMPT" | codex exec 2>/dev/null || {
                echo "Error: Failed to call codex CLI" >&2
                exit 1
            }
            ;;
        gemini)
            echo "$FULL_PROMPT" | gemini exec 2>/dev/null || {
                echo "Error: Failed to call gemini CLI" >&2
                exit 1
            }
            ;;
        opencode)
            echo "$FULL_PROMPT" | opencode run 2>/dev/null || {
                echo "Error: Failed to call opencode CLI" >&2
                exit 1
            }
            ;;
    esac
fi
