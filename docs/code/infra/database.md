# Database (Prisma)

## `PrismaService` — generic, shared

```typescript
// shared/infrastructure/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// shared/infrastructure/prisma/prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Imported once in `AppModule`. `PrismaService` knows nothing about `Customer`, `Veiculo`, or any business concept — it only manages the connection lifecycle.

## Concrete repositories live in each business module, not here

`PrismaCustomerRepository`, `PrismaVeiculoRepository`, etc. are specific to their aggregate (they know the table shape, the specific queries that aggregate needs) and live in `modules/xxx/infrastructure/persistence/`, injecting `PrismaService` internally. See [Repository](../patterns/repository.md) for the full interface/implementation/mapper breakdown.

Don't put anything business-specific in `shared/infrastructure/prisma/` beyond `PrismaService` itself.
