# Architecture documentation

This directory documents the coding architecture and conventions for `mechanic-system` — a NestJS + Prisma project applying tactical DDD in a modular monolith.

## Layers

- **`domain/`** — entities, value objects, repository interfaces (ports), domain errors. Pure TypeScript, zero framework/infrastructure imports.
- **`application/`** — use cases. Orchestrate domain objects and repositories; contain no business rules themselves.
- **`infrastructure/`** — concrete adapters: Prisma repositories, mappers, HTTP controllers/DTOs, mailers, cache adapters.

Dependency direction: `infrastructure` → `application` → `domain`. Nothing in `domain/` ever imports from `application/` or `infrastructure/`.

## Patterns

- [Controller](patterns/controller.md)
- [Use Case](patterns/use-case.md)
- [Repository](patterns/repository.md)
- [Entity](patterns/entity.md)
- [DTO](patterns/dto.md)
- [Error handling](patterns/error-handling.md)
- [Catalog pattern](patterns/catalog-pattern.md)

## Infrastructure

- [Services pattern (Port & Adapter)](infra/services-pattern.md)
- [Email](infra/email.md)
- [Cache](infra/cache.md)
- [Database (Prisma)](infra/database.md)

## Libraries

- [Swagger](libs/swagger.md)

## Related

Git workflow (branching, commits, PRs, changesets) lives in [`../workflow/README.md`](../workflow/README.md).
