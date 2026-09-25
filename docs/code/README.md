# Documentação de arquitetura

Este diretório documenta a arquitetura de código e as convenções do `mechanic-system` — um projeto NestJS + Prisma aplicando DDD tático em um monolito modular.

A arquitetura é **Clean Architecture + Ports & Adapters (Hexagonal)**. As duas não competem: ambas aplicam inversão de dependência pra proteger o domínio. O DDD tático (entities, value objects, repositories) define como modelar o que fica dentro do núcleo.

## Camadas

- **`domain/`** — entities, value objects, enums, interfaces de repository (ports), erros de domínio. TypeScript puro, zero imports de framework/infraestrutura.
- **`application/`** — use cases. Orquestram objetos de domínio e repositories; não contêm regras de negócio.
- **`infrastructure/`** — adapters de **saída** (o sistema chama o mundo externo): repositories Prisma, mappers, mailers, adapters de cache.
- **`presentation/`** — adapters de **entrada** (o mundo externo chama o sistema): controllers, request/response DTOs, guards, decorators, exception filters, interceptors.

Direção da dependência:

- `presentation` → `application` → `domain`
- `infrastructure` → `domain` (implementa os ports definidos lá)

Nada em `domain/` importa de outra camada. `presentation/` nunca importa de `infrastructure/` — o controller fala com o Use Case, nunca com o repository Prisma.

O `xxx.module.ts` na raiz de cada módulo é o **composition root**: o único arquivo que enxerga todas as camadas, onde o token do port é ligado ao adapter concreto (`{ provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository }`).

## Estrutura de um módulo

```
src/
├── modules/
│   └── service-order/
│       ├── service-order.module.ts        → composition root
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── enums/
│       │   ├── repositories/              → ports (interfaces + tokens)
│       │   └── errors/
│       ├── application/
│       │   └── use-cases/
│       ├── infrastructure/
│       │   └── persistence/               → Prisma repository + mapper
│       └── presentation/
│           ├── controllers/
│           └── dtos/
└── shared/                                → só o que é transversal, sem dono de negócio
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

**Só crie uma pasta quando existir o primeiro arquivo dela.** A árvore acima mostra onde cada coisa vai, não uma lista de pastas pra criar vazias.

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
