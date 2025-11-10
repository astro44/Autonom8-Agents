#!/usr/bin/env bash
# UI Agent - Multi-Persona Frontend Specialists via CLI Tools
#
# Uses CLI tools (claude, codex, gemini, opencode) instead of direct API calls
# Behavior determined by symlink name:
#   ui-flutter.sh → claude CLI (Flutter Architect)
#   ui-react.sh → codex CLI (Web Specialist)
#   ui-design.sh → gemini CLI (Design Validator)
#   ui-native.sh → claude CLI (Native Mobile Specialist)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$(basename "$0")"

# Detect persona from script name
PERSONA=""
CLI_TOOL=""

case "$SCRIPT_NAME" in
    ui-flutter.sh)
        PERSONA="flutter"
        CLI_TOOL="claude"
        ;;
    ui-react.sh)
        PERSONA="react"
        CLI_TOOL="codex"
        ;;
    ui-design.sh)
        PERSONA="design"
        CLI_TOOL="gemini"
        ;;
    ui-native.sh)
        PERSONA="native"
        CLI_TOOL="claude"
        ;;
    ui-agent.sh)
        # Direct invocation - require persona in input
        INPUT_PEEK=$(cat)
        PERSONA=$(echo "$INPUT_PEEK" | jq -r '.persona // "flutter"')

        case "$PERSONA" in
            flutter|native) CLI_TOOL="claude" ;;
            react) CLI_TOOL="codex" ;;
            design) CLI_TOOL="gemini" ;;
        esac

        echo "$INPUT_PEEK"  # Pass through for later reading
        ;;
    ui-multi-llm.sh)
        # Multi-LLM workflow - handle separately
        echo "Error: Multi-LLM workflow should be handled by ui-multi-llm.sh" >&2
        exit 1
        ;;
    *)
        echo "Error: Unknown UI agent persona: $SCRIPT_NAME" >&2
        exit 1
        ;;
esac

# Check if CLI tool is available
if ! command -v "$CLI_TOOL" &> /dev/null; then
    echo "Error: CLI tool '$CLI_TOOL' not found in PATH" >&2
    echo "Please install and configure: $CLI_TOOL login" >&2
    exit 1
fi

# Read input from stdin
INPUT=$(cat)

# Extract role from input JSON (default to "implement" for UI agent)
ROLE=$(echo "$INPUT" | jq -r '.role // "implement"')

# Extract prompt from ui-agent.md for this persona and role
extract_prompt() {
    local persona="$1"
    local role="$2"
    local ui_persona="ui-$persona"
    local role_upper=$(echo "$role" | tr '[:lower:]' '[:upper:]')

    awk -v persona="$ui_persona" -v role="$role" -v role_upper="$role_upper" '
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

    /^### Persona: / {
        if (in_role_section && $0 ~ persona) {
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
    ' "$SCRIPT_DIR/ui-agent.md"
}

PROMPT=$(extract_prompt "$PERSONA" "$ROLE")

if [ -z "$PROMPT" ]; then
    echo "Error: Could not find persona '$PERSONA' role '$ROLE' in ui-agent.md" >&2
    exit 1
fi

# Build full prompt with input
FULL_PROMPT="$PROMPT

## Current Task

$INPUT

## Instructions

Based on the task above and your persona responsibilities, provide a detailed implementation following your output format. Apply RUTHLESS attention to detail and ensure all quality gates are met.

Remember the Flutter-first policy: ALWAYS prefer Flutter for new projects and separate app features unless there is a clear technical justification otherwise."

# Extract task metadata from input if available
TASK_ID=$(echo "$INPUT" | jq -r '.task_id // .id // ""')
TASK_TYPE=$(echo "$INPUT" | jq -r '.task_type // .type // ""')

# Determine agent logger path
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AGENT_LOGGER="$ROOT_DIR/bin/agent-logger.sh"

# Check if agent-logger exists
if [[ -f "$AGENT_LOGGER" ]]; then
    # Use comprehensive logging via agent-logger
    echo "$FULL_PROMPT" | "$AGENT_LOGGER" \
        --agent "ui-agent" \
        --persona "ui-$PERSONA" \
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
