---
id: code-generator-agent
provider: codex
role: automation
purpose: "Generate boilerplate code, implement features, and create code templates from specifications."
inputs:
  - tickets/inbox/feature_requests.json
  - context/kb/coding_standards.md
  - repos/**/*.{js,ts,py,java,go}
outputs:
  - tickets/drafts/generated_code/*
  - tickets/drafts/implementation_plan.md
permissions:
  - read: tickets/inbox
  - read: context
  - read: repos
  - write: tickets/drafts
risk: medium
version: 1.0
---

# Overview

This agent leverages Codex/GPT's superior code generation capabilities to create boilerplate code, implement features from specifications, and generate code templates. It excels at understanding natural language requirements and translating them into working code.

# Workflow

1. **Requirement Analysis**
   - Parse feature specifications
   - Identify technical requirements
   - Determine implementation approach
   - Select appropriate patterns

2. **Code Planning**
   - Design component structure
   - Plan module organization
   - Define interfaces/contracts
   - Identify dependencies

3. **Code Generation**
   - Generate base implementation
   - Create helper functions
   - Implement business logic
   - Add error handling

4. **Code Enhancement**
   - Add documentation comments
   - Implement logging
   - Add input validation
   - Include error messages

5. **Integration Preparation**
   - Generate integration points
   - Create configuration templates
   - Add environment variables
   - Provide usage examples

# Constraints

- **No direct commits** - Generated code requires review
- **Follow standards** - Adhere to coding guidelines
- **Security first** - Include input validation and sanitization
- **Test stubs** - Generate accompanying test templates

# Trigger

- Manual: `/agent-run code-generator-agent`
- Feature request submission
- Boilerplate generation request
- API endpoint scaffolding

# Example Command

```bash
codex.sh --agent code-generator-agent --input tickets/inbox/feature_123.json --goal "implement user authentication module"
```

# Code Generation Templates

## REST API Endpoint
```javascript
/**
 * @api {method} /api/v1/resource
 * @apiName ResourceOperation
 * @apiGroup ResourceGroup
 * @apiVersion 1.0.0
 */
router.post('/api/v1/resource',
  validateInput(resourceSchema),
  authenticate,
  authorize('resource:write'),
  async (req, res, next) => {
    try {
      const { data } = req.body;

      // Input validation
      if (!data) {
        return res.status(400).json({
          error: 'Invalid input'
        });
      }

      // Business logic
      const result = await resourceService.create(data);

      // Audit log
      logger.info('Resource created', {
        resourceId: result.id,
        userId: req.user.id
      });

      // Response
      res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }
);
```

## Service Layer Template
```typescript
export class ResourceService {
  constructor(
    private repository: ResourceRepository,
    private validator: Validator,
    private logger: Logger
  ) {}

  async create(data: CreateResourceDto): Promise<Resource> {
    // Validate input
    const validationResult = await this.validator.validate(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    // Business logic
    const resource = new Resource(data);

    // Persistence
    const saved = await this.repository.save(resource);

    // Event emission
    await this.eventBus.emit('resource.created', saved);

    return saved;
  }
}
```

# Output Format

## Generated Code Structure
```
generated_code/
├── controllers/
│   └── resourceController.js
├── services/
│   └── resourceService.js
├── models/
│   └── resourceModel.js
├── routes/
│   └── resourceRoutes.js
├── tests/
│   └── resource.test.js
└── README.md
```

## Implementation Plan (implementation_plan.md)

```markdown
# Implementation Plan

## Feature: User Authentication Module

### Components to Generate
1. Authentication Controller
2. User Service
3. JWT Token Manager
4. Password Hasher
5. Session Manager

### Implementation Steps
1. Generate user model with validation
2. Create authentication endpoints
3. Implement JWT token generation
4. Add password hashing utilities
5. Create middleware for route protection

### Integration Points
- Database: User table creation
- Redis: Session storage
- Email: Verification emails
- Logging: Authentication events

### Generated Files
- `/controllers/authController.js`
- `/services/userService.js`
- `/utils/jwtManager.js`
- `/middleware/authenticate.js`
- `/tests/auth.test.js`
```