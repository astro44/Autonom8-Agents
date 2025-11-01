#!/usr/bin/env bash
# OpenCode Provider Wrapper

export PROVIDER=opencode
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/agent-wrapper.sh" "$@"
