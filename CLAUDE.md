# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start dev server with hot reload
bun run start        # Start production server

# Build
bun run build        # TypeScript compile + Bun build to executable (./out)

# Code Quality
bun run lint         # ESLint with auto-fix
bun run lint:check   # ESLint without fix (CI)
bun run format       # Prettier format
bun run format:check # Prettier check (CI)

# Database (Drizzle ORM)
bun run db:push       # Push schema to database
bun run db:migration  # Generate migration files
bun run db:migrate    # Run pending migrations
```

There is no test runner configured in this project.

## Architecture

**StayHub API** is a property rental management backend using Bun + TypeScript + PostgreSQL (Drizzle ORM). It follows **Clean Architecture** with strict layer separation.

### Layer Structure

Every business module (`auth`, `booking`, `property_management`, `finance`) has four layers:

```
src/[module]/
├── domain/         # Entities, repository interfaces, value objects, events, policies
├── application/    # Use cases, services, DTOs, event handlers
├── infra/          # Drizzle repositories, DI container, external integrations
└── presentation/   # HTTP controllers
```

The `src/core/` module provides shared infrastructure: base entity type, custom errors, `UseCase` interface, HTTP routing, DI wiring, and database setup.

### Key Patterns

**Entities** use a private `#data` field with a Zod schema. Two static factories: `create()` for new objects, `reconstitute()` for loading from DB. Getters expose read-only data. All entities extend `BaseEntity` with `id`, `created_at`, `updated_at`, `deleted_at`.

**Use Cases** implement `UseCase<Input, Output>`. Dependencies injected via constructor. `execute(input, user)` returns a DTO (never a raw entity). Throw domain-specific errors (e.g., `ConflictError`, `ResourceNotFoundError`).

**Controllers** implement `Controller` (`path`, `method`, `handle()`). Validate input with Zod (throw `ValidationError` on failure). Call the use case. Return a DTO — the HTTP adapter serializes it to JSON.

**DI Containers** — each module has a `[Module]Di` class (`AuthDi`, `StayDi`, `PropertyDi`, `FinanceDi`). Factory methods named `make[Component]` wire dependencies. DI instances are created once in `routes.ts`.

**Error Handling** — use cases throw typed errors; the HTTP adapter maps error names to status codes: `ValidationError` → 422, `ConflictError` → 409, `ResourceNotFoundError` → 404, `UnauthorizedError` → 401, `IllegalStateError` → 500.

**Authentication** — JWT Bearer tokens. `SessionManager` creates/validates tokens. Auth middleware extracts the user and passes it to the controller. Routes declare `authenticated: boolean` in `routes.ts`.

### Database

Drizzle ORM schemas live in `src/core/infra/database/drizzle/schemas/`. Repositories use `db.query` and Drizzle DML. Records are mapped to entities via `reconstitute()`.

### Environment Variables

Defined in `src/core/infra/config/environments.ts`:

- `PORT` — server port
- `DATABASE_URL` — PostgreSQL connection string
- `NODE_ENV` — `development | test | sandbox | production`
- `JWT_SECRET` — token signing key

### Code Style

Prettier config: 2-space indent, 80-char line width, double quotes, trailing commas (ES5), semicolons required. ESLint enforces TypeScript strict rules. Husky runs lint + format on pre-commit via lint-staged.

File naming: `snake_case.ts`. Classes: `PascalCase`. Private fields: `#fieldName` (TypeScript private class fields).

## Commit Conventions

Follow **Conventional Commits** format:

```
<type>: <short description in English>
```

Types used in this project:

- `feat` — new feature or behavior
- `fix` — bug fix
- `refactor` — code restructuring without behavior change
- `chore` — tooling, deps, CI/CD, config, non-functional changes

Rules:

- Lowercase type and description
- No period at the end
- Description summarizes the _what_, body (if needed) explains the _why_
- Commits in English
- **After every code modification, create a commit before moving on**
