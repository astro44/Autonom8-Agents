#!/usr/bin/env bash
# Unified PM Agent - Multi-Persona via CLI Tools
#
# Uses CLI tools (claude, codex, gemini, opencode) instead of direct API calls
# Behavior determined by symlink name:
#   pm-codex.sh  → codex CLI (Strategic Planner)
#   pm-gemini.sh → gemini CLI (Quality Reviewer)
#   pm-claude.sh → claude CLI (Prioritizer)

set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "$0")" && pwd)"
AGENT_MD="$AGENT_ROOT/pm-agent.md"

# Detect persona from script name
SCRIPT_NAME=$(basename "$0")
PERSONA=""
CLI_TOOL=""

case "$SCRIPT_NAME" in
    pm-codex.sh)
        PERSONA="codex"
        CLI_TOOL="codex"
        ;;
    pm-gemini.sh)
        PERSONA="gemini"
        CLI_TOOL="gemini"
        ;;
    pm-claude.sh)
        PERSONA="claude"
        CLI_TOOL="claude"
        ;;
    pm-agent.sh)
        # Direct invocation - require persona in input
        INPUT_PEEK=$(cat)
        PERSONA=$(echo "$INPUT_PEEK" | jq -r '.persona // "codex"')

        case "$PERSONA" in
            codex) CLI_TOOL="codex" ;;
            gemini) CLI_TOOL="gemini" ;;
            claude) CLI_TOOL="claude" ;;
        esac

        echo "$INPUT_PEEK"  # Pass through for later reading
        ;;
    *)
        echo "Error: Unknown script name '$SCRIPT_NAME'" >&2
        echo "Expected: pm-codex.sh, pm-gemini.sh, or pm-claude.sh" >&2
        exit 1
        ;;
esac

# Check if CLI tool is available
if ! command -v "$CLI_TOOL" &> /dev/null; then
    echo "Error: CLI tool '$CLI_TOOL' not found in PATH" >&2
    echo "Please install: npm install -g @anthropic-ai/cli" >&2
    exit 1
fi

# Extract prompt from md file for this persona
PROMPT=$(awk -v persona="$PERSONA" '
    /^## Persona: pm-/ {
        current = $3
        gsub(/pm-/, "", current)
        if (current == persona) {
            found = 1
        } else {
            found = 0
        }
    }
    found && /^---$/ {
        exit
    }
    found && /^### System Prompt/ {
        in_prompt = 1
        next
    }
    found && in_prompt {
        print
    }
' "$AGENT_MD")

if [ -z "$PROMPT" ]; then
    echo "Error: Could not find persona '$PERSONA' in $AGENT_MD" >&2
    exit 1
fi

# Read input from stdin
INPUT=$(cat)

# Extract role from input JSON (default to "review" for PM agent)
ROLE=$(echo "$INPUT" | jq -r '.role // "review"')

# Build full prompt with input
FULL_PROMPT="$PROMPT

## Role Context

You are performing the **$ROLE** role for this task.

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
        --agent "pm-agent" \
        --persona "pm-$PERSONA" \
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
