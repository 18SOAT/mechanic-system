# Services pattern (Port & Adapter)

Database connections, email delivery, caching — none of these are part of the business's ubiquitous language (nobody in an Event Storming session says "Redis"). In DDD's strategic vocabulary these are **Generic Subdomains**: technical support capabilities, not the core domain model. They're handled with the Hexagonal Architecture idea of **Port & Adapter**, which is really the same Dependency Inversion idea behind [Repository](../patterns/repository.md), generalized beyond persistence.

## Recipe

1. **Port** — an interface + an injection token (`Symbol`), owned generically (not by any single business module):

```typescript
// shared/infrastructure/xxx/xxx.port.ts
export const XXX = Symbol('XXX');

export interface Xxx {
  doSomething(): Promise<void>;
}
```

2. **Adapter** — the concrete, technology-specific implementation:

```typescript
@Injectable()
export class ConcreteXxxAdapter implements Xxx {
  async doSomething(): Promise<void> { /* vendor-specific code */ }
}
```

3. **Global module** — wires the token to the adapter, imported once:

```typescript
@Global()
@Module({
  providers: [{ provide: XXX, useClass: ConcreteXxxAdapter }],
  exports: [XXX],
})
export class XxxModule {}
```

Business-module Use Cases inject by token (`@Inject(XXX)`), typed by the port interface — never the concrete adapter directly.

## Naming caution: two unrelated meanings of "Service"

- **Domain Service** (DDD tactical pattern) — pure business logic that doesn't naturally belong to one Entity. No I/O, no framework import. Lives in `domain/services/`.
- **Infrastructure Service** (Nest convention: `PrismaService`, `NodemailerEmailService`, `RedisCacheService`) — a technology-specific adapter. Lives in `infrastructure/`.

Same suffix, unrelated concepts — don't confuse the two when reading or writing code.

## Reference example: `PrismaService`

Generic, knows nothing about `Customer`/`Veiculo`/anything business-specific — just manages the connection lifecycle (`onModuleInit`/`onModuleDestroy`). See [database.md](database.md).
