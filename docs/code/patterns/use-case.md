# Use Case

Um Use Case representa uma operação de negócio específica. É um provider normal do NestJS — nada especial pro framework, só uma convenção do projeto.

## Contrato

```typescript
// shared/application/use-case.interface.ts
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
```

Todo Use Case implementa essa interface:

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

Um Use Case sem input usa `void`:

```typescript
export class ListCustomersUseCase implements UseCase<void, Customer[]> {
  async execute(): Promise<Customer[]> { /* ... */ }
}
```

## Regras

- Um Use Case por operação de negócio. Um módulo registra vários providers de Use Case — isso é esperado, não é um smell.
- O Use Case orquestra: carrega via Repository, chama comportamento na Entity, persiste, chama outros colaboradores (Mailer, Cache) quando a operação exige.
- Regras de negócio e invariantes ficam na Entity (ver [Entity](entity.md)), nunca embutidas no Use Case.
- Um Use Case só pode injetar outro Use Case quando a operação tem uma dependência de negócio de fato (ver a nota de anti-pattern em [Controller](controller.md)) — nunca como um orquestrador genérico de passagem.
- Nenhuma preocupação de transporte aqui: nunca monte um status HTTP, nunca conheça um envelope de resposta. Retorne dado de domínio ou lance um `DomainError` tipado (ver [Tratamento de erros](error-handling.md)).
