# Padrão de services (Port & Adapter)

Conexões de banco, envio de email, cache — nenhum desses faz parte da linguagem ubíqua do negócio (ninguém, numa sessão de Event Storming, diz "Redis"). No vocabulário estratégico do DDD, esses são **Generic Subdomains**: capacidades de suporte técnico, não o modelo de domínio central. Eles são tratados com a ideia de **Port & Adapter** da Hexagonal Architecture, que na prática é a mesma ideia de Dependency Inversion por trás do [Repository](../patterns/repository.md), generalizada pra além da persistência.

## Receita

1. **Port** — uma interface + um injection token (`Symbol`), pertencente de forma genérica (não a nenhum módulo de negócio específico):

```typescript
// shared/infrastructure/xxx/xxx.port.ts
export const XXX = Symbol('XXX');

export interface Xxx {
  doSomething(): Promise<void>;
}
```

2. **Adapter** — a implementação concreta, específica da tecnologia:

```typescript
@Injectable()
export class ConcreteXxxAdapter implements Xxx {
  async doSomething(): Promise<void> { /* código específico do vendor */ }
}
```

3. **Módulo global** — conecta o token ao adapter, importado uma única vez:

```typescript
@Global()
@Module({
  providers: [{ provide: XXX, useClass: ConcreteXxxAdapter }],
  exports: [XXX],
})
export class XxxModule {}
```

Use Cases dos módulos de negócio injetam pelo token (`@Inject(XXX)`), tipados pela interface da port — nunca pelo adapter concreto diretamente.

## Cuidado com nomenclatura: dois significados diferentes de "Service"

- **Domain Service** (pattern tático do DDD) — lógica de negócio pura que não pertence naturalmente a nenhuma Entity. Sem I/O, sem import de framework. Fica em `domain/services/`.
- **Infrastructure Service** (convenção do Nest: `PrismaService`, `NodemailerEmailService`, `RedisCacheService`) — um adapter específico de tecnologia. Fica em `infrastructure/`.

Mesmo sufixo, conceitos sem relação — não confunda os dois ao ler ou escrever código.

## Exemplo de referência: `PrismaService`

Genérico, não sabe nada sobre `Customer`/`Veiculo`/qualquer coisa específica de negócio — só gerencia o ciclo de vida da conexão (`onModuleInit`/`onModuleDestroy`). Ver [database.md](database.md).
