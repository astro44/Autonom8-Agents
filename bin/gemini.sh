#!/usr/bin/env bash
# Gemini Provider Wrapper

export PROVIDER=gemini
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/agent-wrapper.sh" "$@"
