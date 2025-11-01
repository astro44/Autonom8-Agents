#!/usr/bin/env bash
# Codex Provider Wrapper

export PROVIDER=codex
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/agent-wrapper.sh" "$@"
