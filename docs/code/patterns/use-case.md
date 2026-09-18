# Use Case

A Use Case represents one specific business operation. It is a normal NestJS provider — nothing special to the framework, just a project-wide convention.

## Contract

```typescript
// shared/application/use-case.interface.ts
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
```

Every Use Case implements this interface:

```typescript
@Injectable()
export class CreateCustomerUseCase implements UseCase<CreateCustomerInput, Customer> {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly repo: CustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const customer = Customer.create(input);
    await this.repo.save(customer);
    return customer;
  }
}
```

A Use Case with no input uses `void`:

```typescript
export class ListCustomersUseCase implements UseCase<void, Customer[]> {
  async execute(): Promise<Customer[]> { /* ... */ }
}
```

## Rules

- One Use Case per business operation. A module registers many Use Case providers — that's expected, not a smell.
- The Use Case orchestrates: loads via Repository, calls behavior on the Entity, persists, calls other collaborators (Mailer, Cache) when the operation requires it.
- Business rules and invariants live on the Entity (see [Entity](entity.md)), never inline in the Use Case.
- A Use Case may inject another Use Case only when the operation has a genuine business dependency on it (see the anti-pattern note in [Controller](controller.md)) — never as a generic pass-through orchestrator.
- No transport concerns here: never build an HTTP status code, never know about a response envelope. Return domain data or throw a typed `DomainError` (see [Error handling](error-handling.md)).
