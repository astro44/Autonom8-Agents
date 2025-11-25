# Project Context

## System Architecture
> High-level overview of the system design, components, and interactions.

### Architecture Style
- **Pattern**: [e.g., Microservices, Monolith, Serverless]
- **Key Components**:
  - [Component A]: [Responsibility]
  - [Component B]: [Responsibility]

### Technology Stack
- **Languages**: [e.g., Go 1.21, TypeScript 5.0]
- **Frameworks**: [e.g., Gin, React, Next.js]
- **Infrastructure**: [e.g., AWS Lambda, Docker, Kubernetes]
- **Database**: [e.g., PostgreSQL 15, Redis]

## Data Models
> Summary of key domain entities and their relationships.

### Key Entities
- **[Entity Name]**: [Description]
  - Key Fields: `id`, `name`, `status`
- **[Entity Name]**: [Description]

### Database Schema Summary
> Paste critical schema snippets or ERD summary here.
```sql
-- Core tables only
CREATE TABLE users (...);
CREATE TABLE orders (...);
```

## API & Interfaces
> Overview of internal and external interfaces.

- **Conventions**: [e.g., RESTful, snake_case json, Bearer auth]
- **Key Endpoints**:
  - `GET /api/v1/resources`: List resources
  - `POST /api/v1/resources`: Create resource

## Coding Standards & Patterns
> Critical patterns developers must follow.

- **Error Handling**: [e.g., Return error as last return value, wrap errors]
- **Logging**: [e.g., Use structured logging, include request_id]
- **Testing**: [e.g., Table-driven tests, 80% coverage required]

## Current State & constraints
> Dynamic section updated frequently.

- **Known Technical Debt**: [e.g., Auth service needs refactoring]
- **Hard Constraints**: [e.g., Must run on 512MB RAM instances]

