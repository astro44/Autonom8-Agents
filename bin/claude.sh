#!/usr/bin/env bash
# Claude Provider Wrapper

export PROVIDER=claude
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/agent-wrapper.sh" "$@"
