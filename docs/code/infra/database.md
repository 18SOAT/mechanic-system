# Database (Prisma)

## `PrismaService` — genérico, compartilhado

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

Importado uma vez no `AppModule`. O `PrismaService` não sabe nada sobre `Customer`, `Vehicle`, ou qualquer conceito de negócio — ele só gerencia o ciclo de vida da conexão.

## Repositories concretos ficam em cada módulo de negócio, não aqui

`PrismaCustomerRepository`, `PrismaVehicleRepository`, etc. são específicos do seu aggregate (conhecem o formato da tabela, as queries específicas que aquele aggregate precisa) e ficam em `modules/xxx/infrastructure/persistence/`, injetando o `PrismaService` internamente. Ver [Repository](../patterns/repository.md) pra o detalhamento completo de interface/implementação/mapper.

Não coloque nada específico de negócio em `shared/infrastructure/prisma/` além do próprio `PrismaService`.
