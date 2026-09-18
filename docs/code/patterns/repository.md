# Repository

Repository follows the Ports & Adapters pattern: an interface (port) owned by the domain, and a concrete implementation (adapter) in infrastructure.

## Interface (port) + token

```typescript
// modules/customer/domain/repositories/customer.repository.ts
export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}
```

`CUSTOMER_REPOSITORY` is a real runtime value (a `Symbol`) — NestJS needs it because TypeScript interfaces are erased at compile time and can't be used as an injection token by themselves.

## Naming: no `I` prefix

The interface keeps the clean name (`CustomerRepository`) because it's the primary abstraction — the one that shows up in every Use Case. The concrete implementation carries the qualifier, since it's the replaceable detail:

```typescript
// modules/customer/infrastructure/persistence/prisma-customer.repository.ts
@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}
  // ...
}
```

## Wiring in the module

```typescript
@Module({
  providers: [
    CreateCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
})
export class CustomerModule {}
```

Use Cases inject by token, type by interface:

```typescript
constructor(
  @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository,
) {}
```

## Generic base interface — keep it minimal

```typescript
// shared/domain/repository.interface.ts
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
}
```

Only put truly universal operations on the base interface. Don't force `delete()` onto every repository if not every aggregate can be deleted — each specific `XxxRepository` extends the base and adds only the queries its aggregate needs (Interface Segregation Principle).

## Mapper: `toEntity` / `toObject`

Prisma's generated types are flat and public; domain Entities are encapsulated and carry Value Objects and behavior. The Mapper is the translation boundary between the two — it lives in infrastructure, next to the repository, never inside the Entity (that would leak a Prisma import into the domain).

```typescript
// modules/customer/infrastructure/persistence/customer.mapper.ts
export class CustomerMapper {
  static toEntity(record: PrismaCustomer): Customer {
    return Customer.restore({
      id: record.id,
      name: record.name,
      document: record.document,
      email: record.email,
    });
  }

  static toObject(entity: Customer): Prisma.CustomerCreateInput {
    return {
      id: entity.idValue,
      name: entity.nameValue,
      document: entity.documentValue,
      email: entity.emailValue,
    };
  }
}
```

### When each one runs

| Operation | What happens |
|---|---|
| Create | `Customer.create(input)` builds the Entity (nothing to read yet) → `save()` calls `toObject` |
| Read (`findById`, `findAll`) | Prisma returns record(s) → `toEntity` (mapped per item for lists) |
| Update | `findById` (`toEntity`, load current state) → mutate via an Entity method → `save` (`toObject`, persist the mutation) |

Update is the only operation that goes through both, because it reads before it writes — this connects directly to the [Entity](entity.md) rule that mutation and validation happen through the Entity, not blindly at the persistence layer.

Don't re-read from the database right after a plain `create()` just to rebuild the Entity — you already have it in memory. The only exception is when the database itself generates a value the domain genuinely needs (rare; not the default case).
