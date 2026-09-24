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
// modules/service-order/infrastructure/cache/service-order-cache.keys.ts
export enum ServiceOrderCacheUsage {
  STATUS_SNAPSHOT = 'status-snapshot',
  AVERAGE_EXECUTION_TIME = 'average-execution-time',
}

export class ServiceOrderCacheKeys {
  static statusSnapshot(id: string): string {
    return `service-order:${id}:${ServiceOrderCacheUsage.STATUS_SNAPSHOT}`;
  }

  static averageExecutionTime(): string {
    return `service-order:${ServiceOrderCacheUsage.AVERAGE_EXECUTION_TIME}`;
  }
}
```

O enum evita a mesma classe de bug do `STATUS_MAP` de erro (ver [Tratamento de erros](../patterns/error-handling.md)): um erro de digitação numa chave escrita à mão quebra silenciosamente os cache hits, sem nenhum aviso do compilador. Ver [Padrão catalog](../patterns/catalog-pattern.md) — mesmo formato de `CustomerError`/`ServiceOrderMailer`.

## Formato da chave: separado por dois-pontos

`entity:id:usage` (ex: `service-order:123:status-snapshot`) — a convenção idiomática do Redis, não underscores. Funciona bem com comandos baseados em pattern (`KEYS service-order:*`) e qualquer ferramenta/observabilidade do Redis que assuma namespacing por dois-pontos.
