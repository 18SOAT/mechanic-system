# Repository

Repository segue o padrão Ports & Adapters: uma interface (port) pertencente ao domain, e uma implementação concreta (adapter) na infrastructure.

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

`CUSTOMER_REPOSITORY` é um valor real em runtime (um `Symbol`) — o NestJS precisa dele porque interfaces do TypeScript são apagadas em tempo de compilação e não podem ser usadas sozinhas como injection token.

## Nomenclatura: sem prefixo `I`

A interface mantém o nome limpo (`CustomerRepository`) porque é a abstração principal — a que aparece em todo Use Case. A implementação concreta carrega o qualificador, já que é o detalhe substituível:

```typescript
// modules/customer/infrastructure/persistence/prisma-customer.repository.ts
@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}
  // ...
}
```

## Conectando no módulo

```typescript
@Module({
  providers: [
    CreateCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
})
export class CustomerModule {}
```

Use Cases injetam pelo token, tipam pela interface:

```typescript
constructor(
  @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository,
) {}
```

## Interface base genérica — mantenha mínima

```typescript
// shared/domain/repository.interface.ts
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
}
```

Coloque na interface base só operações verdadeiramente universais. Não force um `delete()` em todo repository se nem todo aggregate pode ser deletado — cada `XxxRepository` específico estende a base e adiciona só as queries que seu aggregate precisa (Interface Segregation Principle).

## Mapper: `toEntity` / `toObject`

Os tipos gerados pelo Prisma são planos e públicos; as Entities de domain são encapsuladas e carregam Value Objects e comportamento. O Mapper é a fronteira de tradução entre os dois — ele vive na infrastructure, ao lado do repository, nunca dentro da Entity (isso vazaria um import do Prisma pro domain).

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

### Quando cada um roda

| Operação | O que acontece |
|---|---|
| Criação | `Customer.create(input)` constrói a Entity (nada pra ler ainda) → `save()` chama `toObject` |
| Leitura (`findById`, `findAll`) | Prisma retorna o(s) registro(s) → `toEntity` (mapeado por item, no caso de listas) |
| Atualização | `findById` (`toEntity`, carrega o estado atual) → altera via um método da Entity → `save` (`toObject`, persiste a alteração) |

A atualização é a única operação que passa pelos dois, porque lê antes de escrever — isso se conecta diretamente com a regra de [Entity](entity.md) de que alteração e validação acontecem através da Entity, nunca direto na camada de persistência.

Não releia do banco logo depois de um `create()` simples só pra reconstruir a Entity — você já tem ela em memória. A única exceção é quando o próprio banco gera um valor que o domain realmente precisa (raro; não é o caso padrão).
