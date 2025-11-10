#!/usr/bin/env bash
# Test security agent with sample inputs

set -euo pipefail

SECURITY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Security Agent Test Suite"
echo "=========================================="
echo ""

# Test 1: Threat modeling role with claude
echo "Test 1: Threat Modeling (security-claude, role=threat)"
echo "------------------------------------------"
cat <<JSON | "$SECURITY_DIR/security-claude.sh" 2>&1 | head -20 || echo "FAILED (expected - CLI not configured)"
{
  "role": "threat",
  "task_id": "SEC-001",
  "task_type": "threat_model",
  "input": {
    "system": "Web application with user authentication",
    "components": ["frontend", "backend API", "database"],
    "technologies": ["React", "Node.js", "PostgreSQL"]
  }
}
JSON
echo ""

# Test 2: Vulnerability scanning role with codex
echo "Test 2: Vulnerability Scanning (security-codex, role=scan)"
echo "------------------------------------------"
cat <<JSON | "$SECURITY_DIR/security-codex.sh" 2>&1 | head -20 || echo "FAILED (expected - CLI not configured)"
{
  "role": "scan",
  "task_id": "SEC-002",
  "task_type": "sast",
  "input": {
    "repository": "my-app",
    "files": ["src/auth.js", "src/database.js"]
  }
}
JSON
echo ""

# Test 3: Penetration testing role with gemini
echo "Test 3: Penetration Testing (security-gemini, role=pentest)"
echo "------------------------------------------"
cat <<JSON | "$SECURITY_DIR/security-gemini.sh" 2>&1 | head -20 || echo "FAILED (expected - CLI not configured)"
{
  "role": "pentest",
  "task_id": "SEC-003",
  "task_type": "pentest",
  "input": {
    "target": "https://staging.example.com",
    "scope": ["authentication", "authorization", "API endpoints"]
  }
}
JSON
echo ""

# Test 4: Remediation role with opencode
echo "Test 4: Remediation (security-opencode, role=remediate)"
echo "------------------------------------------"
cat <<JSON | "$SECURITY_DIR/security-opencode.sh" 2>&1 | head -20 || echo "FAILED (expected - CLI not configured)"
{
  "role": "remediate",
  "task_id": "SEC-004",
  "task_type": "fix",
  "input": {
    "vulnerability_id": "V-001",
    "type": "SQL Injection",
    "location": "src/database.js:42"
  }
}
JSON
echo ""

# Test 5: Direct invocation with persona in JSON
echo "Test 5: Direct Invocation (security-agent.sh with persona=claude)"
echo "------------------------------------------"
cat <<JSON | "$SECURITY_DIR/security-agent.sh" 2>&1 | head -20 || echo "FAILED (expected - CLI not configured)"
{
  "persona": "claude",
  "role": "threat",
  "task_id": "SEC-005",
  "input": {
    "system": "IoT device firmware"
  }
}
JSON
echo ""

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Expected behavior:"
echo "  ✅ Scripts should extract correct prompts from security-agent.md"
echo "  ✅ Role-based routing should work (threat, scan, pentest, remediate)"
echo "  ✅ Symlink-based persona detection should work"
echo "  ⚠️  CLI calls will fail if tools not configured (expected)"
echo ""
