# Documentação de arquitetura

Este diretório documenta a arquitetura de código e as convenções do `mechanic-system` — um projeto NestJS + Prisma aplicando DDD tático em um monolito modular.

## Camadas

- **`domain/`** — entities, value objects, interfaces de repository (ports), erros de domínio. TypeScript puro, zero imports de framework/infraestrutura.
- **`application/`** — use cases. Orquestram objetos de domínio e repositories; não contêm regras de negócio.
- **`infrastructure/`** — adapters concretos: repositories Prisma, mappers, controllers/DTOs HTTP, mailers, adapters de cache.

Direção da dependência: `infrastructure` → `application` → `domain`. Nada em `domain/` importa de `application/` ou `infrastructure/`.

## Patterns

- [Controller](patterns/controller.md)
- [Use Case](patterns/use-case.md)
- [Repository](patterns/repository.md)
- [Entity](patterns/entity.md)
- [DTO](patterns/dto.md)
- [Tratamento de erros](patterns/error-handling.md)
- [Padrão catalog](patterns/catalog-pattern.md)

## Infraestrutura

- [Padrão de services (Port & Adapter)](infra/services-pattern.md)
- [Email](infra/email.md)
- [Cache](infra/cache.md)
- [Database (Prisma)](infra/database.md)

## Bibliotecas

- [Swagger](libs/swagger.md)

## Relacionado

O fluxo de git (branch, commits, PRs, changesets) está em [`../workflow/README.md`](../workflow/README.md).
