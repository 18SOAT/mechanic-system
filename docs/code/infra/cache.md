# Cache

## Port genérica

```typescript
// shared/infrastructure/cache/cache.port.ts
export const CACHE = Symbol('CACHE');

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  setWithTTL(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}
```

Implementada por um adapter Redis, conectado via um módulo `@Global()` — mesma receita de [services-pattern.md](services-pattern.md). Diferente da `EmailSender`, essa port não carrega nenhum significado de negócio; ela existe só pra que as implementações sejam substituíveis e os consumidores sejam testáveis sem uma instância real do Redis.

## Catalog de chaves de cache por módulo (padrão catalog)

```typescript
// modules/ordem-servico/infrastructure/cache/ordem-servico-cache.keys.ts
export enum OrdemServicoCacheUsage {
  STATUS_SNAPSHOT = 'status-snapshot',
  TEMPO_MEDIO_EXECUCAO = 'tempo-medio-execucao',
}

export class OrdemServicoCacheKeys {
  static statusSnapshot(id: string): string {
    return `ordem-servico:${id}:${OrdemServicoCacheUsage.STATUS_SNAPSHOT}`;
  }

  static tempoMedioExecucao(): string {
    return `ordem-servico:${OrdemServicoCacheUsage.TEMPO_MEDIO_EXECUCAO}`;
  }
}
```

O enum evita a mesma classe de bug do `STATUS_MAP` de erro (ver [Tratamento de erros](../patterns/error-handling.md)): um erro de digitação numa chave escrita à mão quebra silenciosamente os cache hits, sem nenhum aviso do compilador. Ver [Padrão catalog](../patterns/catalog-pattern.md) — mesmo formato de `CustomerError`/`OrdemServicoMailer`.

## Formato da chave: separado por dois-pontos

`entity:id:usage` (ex: `ordem-servico:123:status-snapshot`) — a convenção idiomática do Redis, não underscores. Funciona bem com comandos baseados em pattern (`KEYS ordem-servico:*`) e qualquer ferramenta/observabilidade do Redis que assuma namespacing por dois-pontos.
