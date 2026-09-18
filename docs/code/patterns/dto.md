# DTO

There are two unrelated kinds of DTO, and they solve different problems.

## Request DTO — HTTP-edge format validation

```typescript
export class CreateCustomerRequestDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsCpfCnpj()
  document: string;
}
```

Validated by a `Pipe` (`ValidationPipe` + `class-validator`), before the Controller method runs. It rejects malformed payloads fast, with a proper HTTP 400, before any business logic executes.

### This does not replace Value Object validation

The domain's Value Object (see [Entity](entity.md)) still validates the same kind of thing (format, checksum) — this is not wasted duplication, it's defense in depth for two different boundaries:

- `class-validator` on the DTO protects the **HTTP edge**.
- The Value Object protects the **domain invariant**, guaranteeing it holds no matter which code path constructs the Entity (a queue consumer, a script, another Use Case — none of those go through the HTTP DTO at all).

Extract the actual check (e.g. CPF checksum) into one shared pure function called from both places, so the algorithm itself isn't duplicated — only the call site is.

### Uniqueness checks don't belong in either

"CPF already registered", "email already in use" require a database query — neither `class-validator` (synchronous, per-field) nor a Value Object (must stay pure, no I/O) can do this. It belongs in the Use Case, via the Repository, before constructing/persisting the Entity.

## Response DTO — always a whitelist

```typescript
export class CustomerResponseDto {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
  ) {}

  static fromEntity(customer: Customer): CustomerResponseDto {
    return new CustomerResponseDto(customer.idValue, customer.nameValue, customer.emailValue);
  }
}
```

Explicitly copy only the fields that are safe to expose. **Never rely on a blacklist** (e.g. `@Exclude()` marking sensitive fields) as the primary defense — the same "forget one entry" risk we avoid in [Error handling](error-handling.md)'s status map applies here: a new sensitive field added later leaks silently unless someone remembers to blacklist it. A whitelist fails safe instead — a forgotten field is just missing from the response, never leaked.

Listings reuse the same DTO via `.map(CustomerResponseDto.fromEntity)`. Only create a different DTO shape when the exposed data genuinely differs (e.g. a summarized list item vs. a full detail view).

### Composed / nested responses

When a listing joins data across aggregates (e.g. `Veiculo` with its `Customer` and the customer's `User`), compose a dedicated response DTO in the Repository/Mapper layer. Prisma's selective `select` (only fetching the fields you need, e.g. excluding `hashedPassword` from a nested `user` relation) is a good complementary optimization and an extra layer of defense — but it must never be the *only* defense, since it has to be repeated correctly at every query site. The whitelist DTO remains the single mandatory checkpoint.

Note: composing nested data for a listing/response is a query/presentation concern. It does not mean the `Veiculo` Entity itself should hold a full `Customer` object as part of its consistency boundary — aggregates typically reference each other by id only.
