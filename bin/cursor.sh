#!/usr/bin/env bash
# Cursor Provider Wrapper

export PROVIDER=cursor
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/agent-wrapper.sh" "$@"
