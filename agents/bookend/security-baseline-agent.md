---
name: Shield
id: security-baseline-agent
provider: multi
role: security_baseline
purpose: "Captures pre-sprint dependency vulnerability snapshot and supply chain integrity baseline. At closing, produces a delta showing what the sprint introduced or resolved."
inputs:
  - "package.json"
  - "package-lock.json"
  - "go.mod"
  - "go.sum"
  - "Cargo.toml"
  - "Cargo.lock"
  - "requirements.txt"
  - "pubspec.yaml"
  - "pubspec.lock"
  - "composer.json"
  - "composer.lock"
  - "pom.xml"
  - "build.gradle"
  - "*.csproj"
  - "hardhat.config.*"
  - "foundry.toml"
  - ".terraform.lock.hcl"
  - "project.yaml"
outputs:
  - "reports/bookend/security-baseline.json"
permissions:
  - read: "."
  - write: "reports/bookend"
risk_level: low
version: 1.0.0
created: 2026-05-12
updated: 2026-05-12
---

# Security Baseline Agent

Captures a dependency vulnerability snapshot at sprint opening. At closing, produces a delta showing CVEs introduced, resolved, or unchanged. Does not fix vulnerabilities — reports them for decomposition awareness.

Read-only analysis. Runs audit commands but never modifies packages.

---

## Trigger Conditions

- Opening: runs when complexity >= normal (trigger_above_complexity: normal)
- Closing: always runs to produce delta
- Requires at least one package manifest

## Platform-Specific Audit Commands

### JavaScript/TypeScript
```bash
npm audit --json 2>/dev/null
# or: yarn audit --json
# or: pnpm audit --json
```

### Go
```bash
govulncheck ./... 2>/dev/null
# Fallback: go list -m -json all | check against vuln DB
```

### Rust / Solana
```bash
cargo audit --json 2>/dev/null
```

### Python
```bash
pip audit --format=json 2>/dev/null
# or: safety check --json
# or: uv pip audit
```

### PHP
```bash
composer audit --format=json 2>/dev/null
```

### Java (Maven)
```bash
mvn org.owasp:dependency-check-maven:check -Dformat=JSON 2>/dev/null
# Lightweight: mvn dependency:tree and cross-reference
```

### Java (Gradle)
```bash
gradle dependencyCheckAnalyze 2>/dev/null
```

### .NET / C#
```bash
dotnet list package --vulnerable --format json 2>/dev/null
```

### Flutter / Dart
```bash
# No official audit tool — parse pubspec.lock and check advisories
dart pub outdated --json 2>/dev/null
```

### Solidity
```bash
# Check OpenZeppelin version currency
# Check Hardhat/Foundry dep versions against known issues
# slither . --json - 2>/dev/null (if available)
```
Additional Solidity checks:
- Contract bytecode size (< 24KB EIP-170 limit)
- Reentrancy pattern scan (external calls before state changes)
- tx.origin usage (phishing vector)
- selfdestruct usage (deprecated post-Dencun)
- Unchecked return values on external calls

### Terraform
```bash
# Provider hash integrity
terraform providers lock -platform=linux_amd64 2>/dev/null
# tfsec . --format=json 2>/dev/null
# checkov -d . --output json 2>/dev/null
```

### iOS
```bash
# CocoaPods doesn't have native audit
# Parse Podfile.lock, cross-reference with GitHub advisories
```

### Android
```bash
# Gradle dependency check plugin
gradle dependencyCheckAnalyze 2>/dev/null
```

## Analysis

### 1. Dependency Enumeration

For each detected manifest, enumerate:
- Direct dependency count
- Transitive dependency count (from lockfile)
- Outdated dependency count (major/minor/patch behind)

### 2. Vulnerability Snapshot

Run platform-appropriate audit command. Capture:
- Total CVE count by severity (critical, high, medium, low)
- CVE IDs and affected packages
- Whether fix versions are available

### 3. Supply Chain Integrity

Check lockfile hashes/integrity:
- npm: `integrity` field in package-lock.json
- Go: go.sum hash verification
- Rust: Cargo.lock checksum field
- Terraform: .terraform.lock.hcl provider hashes
- Solidity: OpenZeppelin version pinning

### 4. Closing Delta

Compare against opening baseline:
- New CVEs introduced (deps added or bumped to vulnerable version)
- CVEs resolved (deps updated past fix version)
- Unchanged CVEs (carried through sprint)

## Output Format

```json
{
  "agent": "security-baseline-agent",
  "phase": "opening|closing",
  "status": "clean|warnings|critical",
  "platforms_audited": ["javascript", "go"],
  "dependency_summary": {
    "javascript": {
      "direct": 24,
      "transitive": 312,
      "outdated": 8
    }
  },
  "vulnerability_snapshot": {
    "total": 3,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 0,
    "findings": [
      {
        "platform": "javascript",
        "package": "lodash",
        "version": "4.17.19",
        "cve": "CVE-2021-23337",
        "severity": "high",
        "fix_available": "4.17.21",
        "advisory_url": "https://github.com/advisories/GHSA-35jh-r3h4-6jhm"
      }
    ]
  },
  "supply_chain": {
    "lockfile_integrity": "verified",
    "unsigned_providers": [],
    "unpinned_deps": ["lodash@^4.17.0"]
  },
  "closing_delta": {
    "new_cves": 0,
    "resolved_cves": 1,
    "unchanged_cves": 2,
    "net_status": "improved"
  }
}
```

## Constraints

- Read-only — never install, update, or patch packages
- Audit commands run with --json and stderr suppressed
- Graceful degradation: missing audit tool = skip platform, report gap
- Do not scan node_modules source code (trust audit DB)
- Timeout: 60 seconds max (some audit commands are slow)
- Never output exploit details or PoC code
