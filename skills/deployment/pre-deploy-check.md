# pre-deploy-check

Pre-deployment validation checklist for release readiness.

## Purpose

Performs comprehensive pre-deployment checks to validate that code changes are ready for production. Verifies build status, test coverage, security scans, and deployment configuration.

## Platforms

All (deployment validation applies to all platforms)

## Input Schema

```json
{
  "deployment_target": "production|staging|development",
  "project_dir": "/path/to/project",
  "build_artifacts": {
    "path": "/path/to/build",
    "type": "docker|binary|bundle|lambda"
  },
  "git_info": {
    "branch": "main",
    "commit": "abc123",
    "tag": "v1.2.3"
  },
  "checks_to_run": [
    "build_status",
    "test_coverage",
    "security_scan",
    "config_validation",
    "dependency_audit"
  ],
  "thresholds": {
    "test_coverage_min": 80,
    "critical_vulnerabilities_max": 0,
    "high_vulnerabilities_max": 0
  }
}
```

- `deployment_target` (required): Target environment
- `project_dir` (required): Project root directory
- `build_artifacts` (optional): Built artifacts to validate
- `git_info` (optional): Git context for deployment
- `checks_to_run` (optional): Specific checks to execute
- `thresholds` (optional): Custom pass/fail thresholds

## Check Categories

### Build Status
- [ ] Build completes without errors
- [ ] No compiler warnings (or within threshold)
- [ ] Asset optimization complete
- [ ] Source maps generated (if required)

### Test Coverage
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Coverage meets threshold
- [ ] No skipped critical tests

### Security Scan
- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities (production)
- [ ] Secrets scan clean
- [ ] Dependency audit passed

### Config Validation
- [ ] Environment variables defined
- [ ] Secrets not hardcoded
- [ ] Feature flags configured
- [ ] Database migrations ready

### Dependency Audit
- [ ] No deprecated dependencies
- [ ] License compliance
- [ ] Version pinning verified

## Output Schema

```json
{
  "skill": "pre-deploy-check",
  "status": "success",
  "deployment_target": "production",
  "overall_result": "pass|fail|warn",
  "checks": {
    "build_status": {
      "status": "pass",
      "details": {
        "build_time": "45s",
        "warnings": 0,
        "errors": 0
      }
    },
    "test_coverage": {
      "status": "pass",
      "details": {
        "coverage": 87.5,
        "threshold": 80,
        "tests_passed": 156,
        "tests_failed": 0,
        "tests_skipped": 2
      }
    },
    "security_scan": {
      "status": "pass",
      "details": {
        "critical": 0,
        "high": 0,
        "medium": 3,
        "low": 12
      }
    },
    "config_validation": {
      "status": "warn",
      "details": {
        "missing_vars": [],
        "warnings": ["FEATURE_FLAG_X not set, using default"]
      }
    },
    "dependency_audit": {
      "status": "pass",
      "details": {
        "outdated": 5,
        "deprecated": 0,
        "license_issues": 0
      }
    }
  },
  "blockers": [],
  "warnings": [
    "5 outdated dependencies (non-blocking)",
    "FEATURE_FLAG_X using default value"
  ],
  "recommendations": [
    "Update lodash to latest for security patch",
    "Consider enabling source maps for production debugging"
  ],
  "deployment_approved": true,
  "next_action": "proceed_deploy|fix_blockers|manual_review"
}
```

## Environment-Specific Rules

### Production
- All checks mandatory
- Zero tolerance for critical/high vulnerabilities
- Test coverage must meet threshold
- Approved reviewers required

### Staging
- Security scan required
- Test failures allowed with justification
- Coverage threshold relaxed (70%)

### Development
- Build must pass
- Other checks informational

## Examples

### Ready for Deployment
```json
{
  "skill": "pre-deploy-check",
  "status": "success",
  "overall_result": "pass",
  "deployment_approved": true,
  "blockers": [],
  "next_action": "proceed_deploy"
}
```

### Blocked Deployment
```json
{
  "skill": "pre-deploy-check",
  "status": "success",
  "overall_result": "fail",
  "deployment_approved": false,
  "blockers": [
    "2 critical vulnerabilities in dependencies",
    "Test coverage 65% below 80% threshold"
  ],
  "next_action": "fix_blockers"
}
```
