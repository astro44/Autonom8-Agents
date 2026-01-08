#!/usr/bin/env bash
# Codex Provider Wrapper
# Supports native Codex skill system via --enable skills

set -euo pipefail

export PROVIDER=codex
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments for skill handling
SKILL_NAME=""
ENABLE_SKILLS=false
PASSTHROUGH_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --skill)
            # Convert Claude skill format to Codex format
            # qa/run-tests → qa-run-tests
            SKILL_NAME="${2//\//-}"
            ENABLE_SKILLS=true
            shift 2
            ;;
        --enable)
            if [[ "${2:-}" == "skills" ]]; then
                ENABLE_SKILLS=true
                shift 2
            else
                PASSTHROUGH_ARGS+=("$1")
                shift
            fi
            ;;
        *)
            PASSTHROUGH_ARGS+=("$1")
            shift
            ;;
    esac
done

# Build codex command
CODEX_CMD="codex"

# Enable skills if needed
if [[ "$ENABLE_SKILLS" == "true" ]]; then
    CODEX_CMD="$CODEX_CMD --enable skills"
fi

# If skill was specified, invoke it with $skill-name syntax
if [[ -n "$SKILL_NAME" ]]; then
    # Skill invocation: use exec mode for non-interactive automation
    echo "[codex.sh] Invoking skill: \$${SKILL_NAME}" >&2

    # Execute codex in non-interactive mode with skill
    # Format: codex exec --enable skills "$skill-name" [other args]
    exec codex exec --enable skills "\$${SKILL_NAME}" "${PASSTHROUGH_ARGS[@]}"
else
    # No skill, delegate to agent-wrapper for agent execution
    exec "$SCRIPT_DIR/agent-wrapper.sh" "${PASSTHROUGH_ARGS[@]}"
fi
