#!/usr/bin/env bash
# Agent Wrapper - Resolution Logic Example
# Demonstrates lookup order: Provider overrides → Canonical fallback

set -euo pipefail

# ====================
# Configuration
# ====================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Provider is determined by which wrapper script is used
# e.g., claude.sh sets PROVIDER=claude
PROVIDER="${PROVIDER:-claude}"

# ====================
# Functions
# ====================

usage() {
  cat <<EOF
Usage: $0 run <agent-id> [args...]

Resolves and runs an agent with the following lookup order:
  1. .\${PROVIDER}/overrides/<agent-id>.md (provider-specific)
  2. agents/**/<agent-id>.md (canonical shared)

Examples:
  PROVIDER=claude $0 run pm-agent
  PROVIDER=codex $0 run po-pm-agent
  PROVIDER=gemini $0 run smoke-test-agent

Environment:
  PROVIDER      Provider name (claude|gemini|codex|opencode)
  MODULE_ROOT   Path to Autonom8-Agents module
EOF
  exit 1
}

resolve_agent() {
  local agent_id="$1"
  local spec_file=""

  # Step 1: Check provider override first
  local override_path="$MODULE_ROOT/.$PROVIDER/overrides/$agent_id.md"
  if [ -f "$override_path" ]; then
    spec_file="$override_path"
    echo "[INFO] Using provider override: $spec_file" >&2
    echo "$spec_file"
    return 0
  fi

  # Step 2: Fallback to canonical agent using fd (fast find)
  if command -v fd &>/dev/null; then
    spec_file=$(fd -a "$agent_id.md" "$MODULE_ROOT/agents" | head -n1)
  else
    # Fallback to find if fd not available
    spec_file=$(find "$MODULE_ROOT/agents" -type f -name "$agent_id.md" | head -n1)
  fi

  if [ -n "$spec_file" ] && [ -f "$spec_file" ]; then
    echo "[INFO] Using canonical agent: $spec_file" >&2
    echo "$spec_file"
    return 0
  fi

  # Step 3: Not found
  echo "[ERROR] Agent '$agent_id' not found" >&2
  echo "[ERROR] Searched:" >&2
  echo "[ERROR]   - $override_path" >&2
  echo "[ERROR]   - $MODULE_ROOT/agents/**/$agent_id.md" >&2
  return 1
}

list_agents() {
  echo "Available Agents for provider: $PROVIDER"
  echo ""
  echo "Provider Overrides (.${PROVIDER}/overrides/):"
  find "$MODULE_ROOT/.$PROVIDER/overrides" -type f -name "*.md" 2>/dev/null | while read -r file; do
    basename "$file" .md | sed 's/^/  - /'
  done || echo "  (none)"

  echo ""
  echo "Canonical Agents (agents/**/): "
  if [ -f "$MODULE_ROOT/agent-index.json" ]; then
    jq -r 'keys[]' "$MODULE_ROOT/agent-index.json" | sed 's/^/  - /'
  else
    find "$MODULE_ROOT/agents" -type f -name "*.md" -not -name "README.md" 2>/dev/null | while read -r file; do
      basename "$file" .md | sed 's/^/  - /'
    done
  fi
}

run_agent() {
  local agent_id="$1"
  shift

  # Resolve agent spec file
  local spec_file
  spec_file=$(resolve_agent "$agent_id") || exit 1

  # Load policies/schemas if specified in manifest
  local manifest_file="$MODULE_ROOT/manifest.yaml"
  if [ -f "$manifest_file" ] && command -v yq &>/dev/null; then
    echo "[INFO] Loading policies and schemas from manifest..." >&2
    # Example: yq eval logic to load policies/schemas
    # This would be expanded based on actual implementation
  fi

  # Execute agent using appropriate CLI
  # This is a placeholder - actual execution would use claude, gemini, codex, or opencode CLI
  echo "[INFO] Executing $PROVIDER agent: $agent_id" >&2
  echo "[INFO] Spec file: $spec_file" >&2
  echo "[INFO] Arguments: $*" >&2

  case "$PROVIDER" in
    claude)
      # claude run --spec "$spec_file" "$@"
      echo "[EXEC] claude run --spec \"$spec_file\" $*"
      ;;
    gemini)
      # gemini run --spec "$spec_file" "$@"
      echo "[EXEC] gemini run --spec \"$spec_file\" $*"
      ;;
    codex)
      # codex run --spec "$spec_file" "$@"
      echo "[EXEC] codex run --spec \"$spec_file\" $*"
      ;;
    opencode)
      # opencode run --spec "$spec_file" "$@"
      echo "[EXEC] opencode run --spec \"$spec_file\" $*"
      ;;
    *)
      echo "[ERROR] Unknown provider: $PROVIDER" >&2
      exit 1
      ;;
  esac
}

# ====================
# Main
# ====================

main() {
  if [ $# -eq 0 ]; then
    usage
  fi

  local command="$1"
  shift

  case "$command" in
    run)
      if [ $# -eq 0 ]; then
        echo "[ERROR] Missing agent-id" >&2
        usage
      fi
      run_agent "$@"
      ;;
    list|ls)
      list_agents
      ;;
    resolve)
      if [ $# -eq 0 ]; then
        echo "[ERROR] Missing agent-id" >&2
        usage
      fi
      resolve_agent "$1"
      ;;
    help|--help|-h)
      usage
      ;;
    *)
      echo "[ERROR] Unknown command: $command" >&2
      usage
      ;;
  esac
}

main "$@"
