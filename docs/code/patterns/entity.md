# Entity

An Entity is the source of truth for its own identity and validity. It should never be constructible in an invalid state, no matter which code path creates it (HTTP, a queue consumer, a script, another Use Case).

## Private constructor + static factories

```typescript
export class Customer {
  private constructor(
    private readonly id: string,
    private name: string,
    private readonly document: CpfCnpj,
    private email: string,
  ) {}

  static create(input: { name: string; document: string; email: string }): Customer {
    return new Customer(
      crypto.randomUUID(),
      input.name,
      CpfCnpj.create(input.document), // validates here, throws a domain error if invalid
      input.email,
    );
  }

  static restore(props: { id: string; name: string; document: string; email: string }): Customer {
    // used only by the Mapper, to rebuild from already-persisted (already-valid) data
    return new Customer(props.id, props.name, CpfCnpj.create(props.document), props.email);
  }
}
```

- `create()` — a brand-new instance. Generates the id and runs full validation.
- `restore()` — reconstructs an instance coming from persistence. Used only by the Mapper's `toEntity` (see [Repository](repository.md)).

## IDs are generated in the domain, not by the database

`crypto.randomUUID()` (built into Node, no extra dependency) runs inside `create()`. The Prisma schema's `id` column has no `@default(uuid())`.

This matters because it keeps the Entity self-sufficient: it has a stable identity the moment it's created in memory, with no need to round-trip through the database (and back through `toEntity`) just to learn its own id.

## Value Objects for validated/sensitive fields

CPF/CNPJ, license plate ("placa") and similar fields are Value Objects, not raw strings. The VO validates on construction, guaranteeing the invariant holds **regardless of caller** — this is not redundant with request-level `class-validator` checks (see [DTO](dto.md)); the two protect different boundaries. Extract the actual validation algorithm (e.g. CPF check-digit logic) into one shared pure function reused by both the VO and the `class-validator` custom decorator, so the rule is written once even though it's invoked from two places.

## Business rules live here, not in the Use Case

```typescript
export class OrdemServico {
  aprovarOrcamento(): void {
    if (this.status !== OrdemServicoStatus.AGUARDANDO_APROVACAO) {
      throw OrdemServicoError.invalidStatusTransition(this.status);
    }
    this.status = OrdemServicoStatus.EM_EXECUCAO;
  }
}
```

The Use Case only calls `os.aprovarOrcamento()` — it never inlines the status-transition check itself.

## Sensitive fields: no public raw getter

```typescript
export class User {
  private constructor(
    private readonly id: string,
    private readonly hashedPassword: string, // explicit name — never `password`
  ) {}

  async verifyPassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.hashedPassword);
  }
  // no `get password()` — nothing outside the entity can read the raw hash
}
```

Authentication logic calls `verifyPassword()`; it never needs to read the raw hash. If the Mapper genuinely needs to read it for persistence, expose a getter named explicitly (`hashedPassword`), never `password` — the name itself should make it obvious this isn't safe to put in a Response DTO. See [DTO](dto.md) for the response-side whitelist rule that's the actual safety net.

## Never import Prisma types here

Translating to/from the persistence shape is the Mapper's job (see [Repository](repository.md)), specifically so the domain stays framework/ORM-agnostic.
