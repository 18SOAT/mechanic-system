# Catalog pattern

A recurring shape across this codebase: **one class per module acting as a catalog, with one static factory method per specific variant** (usually backed by an enum), instead of one generic method taking a "type" parameter.

## Where it shows up

| Concern | Catalog class | Variant example |
|---|---|---|
| Domain errors | `CustomerError` | `.notFound()`, `.documentAlreadyInUse()` — see [Error handling](error-handling.md) |
| Email | `OrdemServicoMailer` | `.sendStatusUpdated()`, `.sendOrcamentoApproved()` — see [infra/email.md](../infra/email.md) |
| Cache keys | `OrdemServicoCacheKeys` | `.statusSnapshot(id)`, `.tempoMedioExecucao()` — see [infra/cache.md](../infra/cache.md) |

## Why not a generic dispatch method

A single method like `mailer.send(EmailType.STATUS_UPDATED, data)` forces `data` into a generic/union shape, losing per-call type safety (nothing guarantees `data` has the right fields for that specific `EmailType`), hurts autocomplete, and makes it harder to test one variant in isolation. A dedicated method per variant keeps each call site fully typed and makes the class itself a browsable catalog of "everything this module can do" in that category.

## The shape

```typescript
export class XxxCatalog {
  private constructor(/* ... */) {}

  static variantOne(params: SpecificParamsA): XxxCatalog { /* ... */ }
  static variantTwo(params: SpecificParamsB): XxxCatalog { /* ... */ }
}
```

Apply this shape whenever a new "one class producing several named, structurally different things for a module" need shows up (e.g. a future notification catalog, an audit-log catalog) — don't reinvent the decision from scratch each time.
