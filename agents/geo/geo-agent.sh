#!/usr/bin/env bash
# Geo Agent - Maps & Location Specialist
#
# Platform-agnostic specialist for map, location, and geospatial implementations.
# Uses CLI tools (claude, codex, gemini, opencode) based on symlink name.

set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "$0")" && pwd)"
AGENT_MD="$AGENT_ROOT/geo-agent.md"

# Detect CLI tool from script name or input
SCRIPT_NAME=$(basename "$0")
CLI_TOOL=""

case "$SCRIPT_NAME" in
    geo-claudecode.sh|geo-claude.sh)
        CLI_TOOL="claude"
        ;;
    geo-opencode.sh)
        CLI_TOOL="opencode"
        ;;
    geo-gemini.sh)
        CLI_TOOL="gemini"
        ;;
    geo-codex.sh)
        CLI_TOOL="codex"
        ;;
    geo-agent.sh)
        # Direct invocation - check for CLI in input or default to claude
        INPUT_PEEK=$(cat)
        CLI_TOOL=$(echo "$INPUT_PEEK" | jq -r '.cli // "claude"')
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
    exit 1
fi

# Read agent definition
if [[ ! -f "$AGENT_MD" ]]; then
    echo "Error: Agent definition not found at $AGENT_MD" >&2
    exit 1
fi

AGENT_PROMPT=$(cat "$AGENT_MD")

# Read input (task/ticket data)
INPUT=$(cat)

# Build full prompt
FULL_PROMPT="$AGENT_PROMPT

---

## Task Input

$INPUT

---

## Instructions

1. Read project.yaml to check for configured map services
2. Use the configured provider - do NOT create custom implementations
3. Follow platform-specific patterns from the agent definition
4. Return response in the JSON format specified above
"

# Determine agent logger path
ROOT_DIR="$(dirname "$AGENT_ROOT")"
AGENT_LOGGER="$ROOT_DIR/bin/agent-logger.sh"

# Extract task metadata from input
TASK_ID=$(echo "$INPUT" | jq -r '.task_id // .id // .ticket_id // ""')
TASK_TYPE=$(echo "$INPUT" | jq -r '.task_type // .type // "geo"')

# Execute via agent logger or direct CLI
if [[ -f "$AGENT_LOGGER" ]]; then
    echo "$FULL_PROMPT" | "$AGENT_LOGGER" \
        --agent "geo-agent" \
        --persona "geo" \
        --cli "$CLI_TOOL" \
        --task "$TASK_ID" \
        --task-type "$TASK_TYPE" \
        --session "${AGENT_SESSION_ID:-}"
else
    # Fallback: direct CLI call
    case "$CLI_TOOL" in
        claude)
            echo "$FULL_PROMPT" | claude exec 2>/dev/null
            ;;
        codex)
            echo "$FULL_PROMPT" | codex exec 2>/dev/null
            ;;
        gemini)
            echo "$FULL_PROMPT" | gemini exec 2>/dev/null
            ;;
        opencode)
            echo "$FULL_PROMPT" | opencode run 2>/dev/null
            ;;
    esac
fi
