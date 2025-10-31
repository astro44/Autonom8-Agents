---
id: api-builder-agent
provider: codex
role: automation
purpose: "Design and generate RESTful APIs, GraphQL schemas, and API documentation from specifications."
inputs:
  - tickets/inbox/api_specs.yaml
  - context/kb/api_standards.md
  - repos/**/openapi.yaml
outputs:
  - tickets/drafts/api_implementation/*
  - tickets/drafts/openapi_spec.yaml
  - tickets/drafts/graphql_schema.graphql
permissions:
  - read: tickets/inbox
  - read: context
  - read: repos
  - write: tickets/drafts
risk: medium
version: 1.0
---

# Overview

This agent leverages Codex's code generation capabilities to build complete API implementations from specifications. It generates REST endpoints, GraphQL schemas, middleware, validation, and comprehensive API documentation.

# Workflow

1. **Specification Analysis**
   - Parse API specifications
   - Extract resource definitions
   - Identify relationships
   - Define operations

2. **API Design**
   - Design resource endpoints
   - Plan URL structure
   - Define request/response schemas
   - Design error handling

3. **Implementation Generation**
   - Generate route handlers
   - Create controllers
   - Build validation middleware
   - Implement business logic

4. **Documentation Creation**
   - Generate OpenAPI spec
   - Create GraphQL schema
   - Build Postman collection
   - Generate client SDKs

5. **Testing Setup**
   - Generate API tests
   - Create mock data
   - Build test scenarios
   - Generate load tests

# Constraints

- **RESTful principles** - Follow REST best practices
- **Security by default** - Include authentication/authorization
- **Versioning** - Support API versioning
- **Rate limiting** - Include rate limit middleware

# Trigger

- Manual: `/agent-run api-builder-agent`
- API specification upload
- New service creation
- API modernization projects

# Example Command

```bash
codex.sh --agent api-builder-agent --input tickets/inbox/user_api.yaml --goal "generate complete user management API"
```

# API Templates

## REST Endpoint Structure
```javascript
// Route Definition
router.route('/api/v1/users')
  .get(
    authenticate,
    authorize('users:read'),
    paginate,
    async (req, res) => {
      const users = await userService.findAll(req.query);
      res.json({
        success: true,
        data: users,
        meta: req.pagination
      });
    }
  )
  .post(
    authenticate,
    authorize('users:write'),
    validate(createUserSchema),
    async (req, res) => {
      const user = await userService.create(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    }
  );

router.route('/api/v1/users/:id')
  .get(
    authenticate,
    authorize('users:read'),
    async (req, res) => {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      res.json({
        success: true,
        data: user
      });
    }
  )
  .patch(
    authenticate,
    authorize('users:write'),
    validate(updateUserSchema),
    async (req, res) => {
      const user = await userService.update(req.params.id, req.body);
      res.json({
        success: true,
        data: user
      });
    }
  )
  .delete(
    authenticate,
    authorize('users:delete'),
    async (req, res) => {
      await userService.delete(req.params.id);
      res.status(204).send();
    }
  );
```

## GraphQL Schema
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]!
}

enum UserRole {
  ADMIN
  USER
  GUEST
}

type Query {
  user(id: ID!): User
  users(
    filter: UserFilter
    pagination: PaginationInput
    sort: SortInput
  ): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  email: String!
  name: String!
  password: String!
  role: UserRole
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

## OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        201:
          description: Created
```

# Output Format

## API Implementation Structure
```
api_implementation/
├── routes/
│   ├── userRoutes.js
│   ├── authRoutes.js
│   └── index.js
├── controllers/
│   ├── userController.js
│   └── authController.js
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   └── rateLimit.js
├── schemas/
│   ├── userSchemas.js
│   └── authSchemas.js
├── graphql/
│   ├── schema.graphql
│   ├── resolvers.js
│   └── dataloaders.js
├── docs/
│   ├── openapi.yaml
│   ├── postman.json
│   └── README.md
└── tests/
    ├── users.test.js
    └── auth.test.js
```