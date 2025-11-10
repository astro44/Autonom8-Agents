#!/usr/bin/env bash
# Unified DevOps Agent - Multi-Persona via CLI Tools
#
# Uses CLI tools (claude, codex, gemini, opencode) instead of direct API calls
# Behavior determined by symlink name:
#   devops-codex.sh → codex CLI (Infrastructure Planner)
#   devops-terraform.sh → claude CLI (Terraform Generator)
#   devops-deployer.sh → gemini CLI (Deployment Orchestrator)
#   devops-cost.sh → codex CLI (Cost Optimizer)

set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "$0")" && pwd)"
AGENT_MD="$AGENT_ROOT/devops-agent.md"

# Detect persona from script name
SCRIPT_NAME=$(basename "$0")
PERSONA=""
CLI_TOOL=""

case "$SCRIPT_NAME" in
    devops-codex.sh)
        PERSONA="codex"
        CLI_TOOL="codex"
        ;;
    devops-terraform.sh)
        PERSONA="terraform"
        CLI_TOOL="claude"
        ;;
    devops-deployer.sh)
        PERSONA="deployer"
        CLI_TOOL="gemini"
        ;;
    devops-cost.sh)
        PERSONA="cost"
        CLI_TOOL="codex"
        ;;
    devops-agent.sh)
        # Direct invocation - require persona in input
        INPUT_PEEK=$(cat)
        PERSONA=$(echo "$INPUT_PEEK" | jq -r '.persona // "codex"')

        case "$PERSONA" in
            codex|cost) CLI_TOOL="codex" ;;
            terraform) CLI_TOOL="claude" ;;
            deployer) CLI_TOOL="gemini" ;;
        esac

        echo "$INPUT_PEEK"  # Pass through for later reading
        ;;
    *)
        echo "Error: Unknown script name '$SCRIPT_NAME'" >&2
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

# Extract role from input JSON (default to "provision" for DevOps agent)
ROLE=$(echo "$INPUT" | jq -r '.role // "provision"')

# Extract prompt from md file for this persona and role
extract_prompt() {
    local persona="$1"
    local role="$2"
    local devops_persona="devops-$persona"
    local role_upper=$(echo "$role" | tr '[:lower:]' '[:upper:]')

    awk -v persona="$devops_persona" -v role="$role" -v role_upper="$role_upper" '
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
    ' "$AGENT_MD"
}

PROMPT=$(extract_prompt "$PERSONA" "$ROLE")

if [ -z "$PROMPT" ]; then
    echo "Error: Could not find persona '$PERSONA' role '$ROLE' in $AGENT_MD" >&2
    exit 1
fi

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
        --agent "devops-agent" \
        --persona "devops-$PERSONA" \
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
