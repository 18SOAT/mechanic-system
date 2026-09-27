# Entity

Uma Entity é a fonte da verdade da própria identidade e validade. Ela nunca deve poder ser construída em um estado inválido, não importa qual caminho de código a crie (HTTP, um consumer de fila, um script, outro Use Case).

## Constructor privado + factories estáticas

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
      IdGenerator.generate(),
      input.name,
      CpfCnpj.create(input.document), // valida aqui, lança um erro de domínio se inválido
      input.email,
    );
  }

  static restore(props: { id: string; name: string; document: string; email: string }): Customer {
    // usado só pelo Mapper, pra reconstruir a partir de dados já persistidos (já válidos)
    return new Customer(props.id, props.name, CpfCnpj.create(props.document), props.email);
  }
}
```

- `create()` — uma instância nova. Gera o id e roda a validação completa.
- `restore()` — reconstrói uma instância vinda da persistência. Usado só pelo `toEntity` do Mapper (ver [Repository](repository.md)).

## IDs são gerados no domain, não pelo banco

`IdGenerator.generate()` (`shared/domain/id-generator.ts`) roda dentro do `create()` e gera um **UUID v7** (lib `uuid` — o Node 22 ainda não tem `randomUUIDv7`). A coluna `id` do schema do Prisma não tem `@default(uuid())`.

Por que v7 e não v4 (`crypto.randomUUID()`): o v7 começa com um timestamp, então os ids novos são sempre "maiores" que os anteriores. O índice da PK no Postgres cresce só no final, em vez de receber inserts aleatórios espalhados pela árvore — inserts mais baratos e índice menos fragmentado.

Isso importa porque mantém a Entity autossuficiente: ela tem uma identidade estável no momento em que é criada em memória, sem precisar ir e voltar do banco (e passar de novo por `toEntity`) só pra saber o próprio id.

## Value Objects pra campos validados/sensíveis

CPF/CNPJ, placa e campos parecidos são Value Objects, não strings soltas. O VO valida na construção, garantindo que o invariante se mantenha **independente de quem chama** — isso não é redundante com as checagens do `class-validator` em nível de request (ver [DTO](dto.md)); os dois protegem fronteiras diferentes. Extraia o algoritmo de validação de fato (ex: lógica de dígito verificador de CPF) pra uma única função pura compartilhada, reusada tanto pelo VO quanto pelo decorator customizado do `class-validator`, de forma que a regra seja escrita uma vez só, mesmo sendo invocada em dois lugares.

## Regras de negócio ficam aqui, não no Use Case

```typescript
export class ServiceOrder {
  approveQuote(): void {
    if (this.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      throw ServiceOrderError.invalidStatusTransition(this.status);
    }
    this.status = ServiceOrderStatus.IN_EXECUTION;
  }
}
```

O Use Case só chama `serviceOrder.approveQuote()` — ele nunca embute a checagem de transição de status.

## Campos sensíveis: sem getter público do valor bruto

```typescript
export class User {
  private constructor(
    private readonly id: string,
    private readonly passwordHash: string, // nunca `password`
  ) {}

  // O hasher é um port do domain (modules/user/domain/ports/password-hasher.port.ts),
  // recebido como parâmetro — o bcrypt fica no adapter, fora do domain.
  verifyPassword(plainTextPassword: string, hasher: PasswordHasher): Promise<boolean> {
    return hasher.compare(plainTextPassword, this.passwordHash);
  }
  // sem `get password()` — nada fora da entity consegue ler o hash bruto
}
```

Por que passar o hasher como parâmetro em vez de importar `bcrypt` na entity: o domain não pode depender de lib de infraestrutura. A entity continua decidindo **quando** comparar (é o comportamento dela); o adapter (`BcryptPasswordHasher`) decide **como**. Em teste, um hasher fake entra no lugar sem mock de módulo.

A lógica de autenticação chama `verifyPassword()`; ela nunca precisa ler o hash bruto. Se o Mapper realmente precisar ler pra persistência, exponha um getter com nome explícito (`hashedPassword`), nunca `password` — o próprio nome já deve deixar óbvio que isso não é seguro pra colocar num Response DTO. Ver [DTO](dto.md) pra a regra de whitelist do lado de resposta, que é a rede de segurança de fato.

## Nunca importe tipos do Prisma aqui

Traduzir de/para o formato de persistência é trabalho do Mapper (ver [Repository](repository.md)), justamente pra manter o domain independente de framework/ORM.
