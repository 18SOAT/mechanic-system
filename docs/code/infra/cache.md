# Cache

## Generic port

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

Backed by a Redis adapter, wired through an `@Global()` module — same recipe as [services-pattern.md](services-pattern.md). Unlike `EmailSender`, this port carries no business meaning at all; it exists purely so implementations are swappable and consumers are testable without a real Redis instance.

## Per-module cache-key catalog (catalog pattern)

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

The enum prevents the same class of bug as the error `STATUS_MAP` (see [Error handling](../patterns/error-handling.md)): a typo in a hand-written key string silently breaks cache hits, with no compiler warning. See [Catalog pattern](../patterns/catalog-pattern.md) — same shape as `CustomerError`/`OrdemServicoMailer`.

## Key format: colon-separated

`entity:id:usage` (e.g. `ordem-servico:123:status-snapshot`) — the idiomatic Redis convention, not underscores. It plays well with pattern-based commands (`KEYS ordem-servico:*`) and any Redis tooling/observability that assumes colon namespacing.
