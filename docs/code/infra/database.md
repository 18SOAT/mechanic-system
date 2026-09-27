# Database (Prisma)

## `PrismaService` — genérico, compartilhado

```typescript
// shared/infrastructure/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Conexão lazy (sem `$connect` no boot)

O Prisma conecta sozinho na primeira query, então não existe `onModuleInit` chamando `$connect()`.

- **Ganho:** a aplicação sobe sem banco. É isso que deixa o e2e do CI (que sobe o `AppModule` inteiro e não tem Postgres) passar.
- **Custo:** perde o fail-fast. Um `DATABASE_URL` errado não derruba o boot, só aparece na primeira query. Quando existir health check, ele deve fazer um `SELECT 1` pra cobrir isso.

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
