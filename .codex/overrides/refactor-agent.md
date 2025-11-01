---
id: refactor-agent
provider: codex
role: code_review
purpose: "Refactor code for improved readability, performance, and maintainability while preserving functionality."
inputs:
  - repos/**/*.{js,ts,py,java,go}
  - context/kb/refactoring_patterns.md
  - tickets/inbox/refactor_requests.json
outputs:
  - tickets/drafts/refactored_code/*
  - tickets/drafts/refactoring_report.md
permissions:
  - read: repos
  - read: context
  - read: tickets/inbox
  - write: tickets/drafts
risk: medium
version: 1.0
---

# Overview

This agent specializes in code refactoring using GPT/Codex's deep understanding of code patterns and best practices. It identifies code smells, applies refactoring patterns, and improves code quality while maintaining functionality.

# Workflow

1. **Code Analysis**
   - Identify code smells
   - Detect duplicate code
   - Find complex methods
   - Locate coupling issues

2. **Refactoring Strategy**
   - Select appropriate patterns
   - Plan refactoring steps
   - Assess impact radius
   - Identify test requirements

3. **Code Transformation**
   - Extract methods/classes
   - Simplify conditionals
   - Remove duplication
   - Improve naming

4. **Quality Improvements**
   - Enhance readability
   - Reduce complexity
   - Improve performance
   - Add missing types/docs

5. **Validation**
   - Ensure functionality preserved
   - Verify test compatibility
   - Check style compliance
   - Validate improvements

# Constraints

- **Preserve behavior** - No functional changes
- **Incremental changes** - Small, reviewable commits
- **Test compatibility** - Ensure existing tests pass
- **Backwards compatible** - Maintain API contracts

# Trigger

- Manual: `/agent-run refactor-agent`
- Code review suggestions
- Technical debt sprints
- Performance optimization tasks

# Example Command

```bash
codex.sh --agent refactor-agent --input repos/legacy/module.js --goal "reduce complexity and improve readability"
```

# Refactoring Patterns

## Method Extraction
```javascript
// Before
function processOrder(order) {
  // Validate order
  if (!order.id || !order.items || order.items.length === 0) {
    throw new Error('Invalid order');
  }
  if (order.total < 0) {
    throw new Error('Invalid total');
  }

  // Calculate discount
  let discount = 0;
  if (order.customer.type === 'premium') {
    discount = order.total * 0.1;
  } else if (order.customer.type === 'regular' && order.total > 100) {
    discount = order.total * 0.05;
  }

  // Process payment
  const finalAmount = order.total - discount;
  // ... payment logic
}

// After
function processOrder(order) {
  validateOrder(order);
  const discount = calculateDiscount(order);
  const finalAmount = order.total - discount;
  processPayment(finalAmount, order);
}

function validateOrder(order) {
  if (!order.id || !order.items || order.items.length === 0) {
    throw new Error('Invalid order');
  }
  if (order.total < 0) {
    throw new Error('Invalid total');
  }
}

function calculateDiscount(order) {
  if (order.customer.type === 'premium') {
    return order.total * 0.1;
  }
  if (order.customer.type === 'regular' && order.total > 100) {
    return order.total * 0.05;
  }
  return 0;
}
```

## Early Return Pattern
```javascript
// Before
function getUserRole(user) {
  let role;
  if (user) {
    if (user.isAdmin) {
      role = 'admin';
    } else {
      if (user.isModerator) {
        role = 'moderator';
      } else {
        role = 'user';
      }
    }
  } else {
    role = 'guest';
  }
  return role;
}

// After
function getUserRole(user) {
  if (!user) return 'guest';
  if (user.isAdmin) return 'admin';
  if (user.isModerator) return 'moderator';
  return 'user';
}
```

# Output Format

## Refactoring Report (refactoring_report.md)

```markdown
# Refactoring Report

## Summary
- Files Refactored: 5
- Code Smells Fixed: 23
- Complexity Reduction: 35%
- Lines Reduced: 150

## Changes by File

### /services/orderService.js
**Issues Fixed:**
- Long method (150 lines → 3 methods of ~50 lines)
- Duplicate code removed
- Complex conditionals simplified

**Patterns Applied:**
- Method Extraction
- Early Return
- Guard Clauses

### Metrics Improvement
| Metric | Before | After |
|--------|--------|-------|
| Cyclomatic Complexity | 15 | 6 |
| Lines of Code | 150 | 95 |
| Duplication | 25% | 5% |

## Risk Assessment
- **Low Risk:** No functional changes
- **Testing:** All existing tests pass
- **Performance:** 10% improvement in execution time
```