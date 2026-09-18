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
      crypto.randomUUID(),
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

`crypto.randomUUID()` (nativo do Node, sem dependência extra) roda dentro do `create()`. A coluna `id` do schema do Prisma não tem `@default(uuid())`.

Isso importa porque mantém a Entity autossuficiente: ela tem uma identidade estável no momento em que é criada em memória, sem precisar ir e voltar do banco (e passar de novo por `toEntity`) só pra saber o próprio id.

## Value Objects pra campos validados/sensíveis

CPF/CNPJ, placa e campos parecidos são Value Objects, não strings soltas. O VO valida na construção, garantindo que o invariante se mantenha **independente de quem chama** — isso não é redundante com as checagens do `class-validator` em nível de request (ver [DTO](dto.md)); os dois protegem fronteiras diferentes. Extraia o algoritmo de validação de fato (ex: lógica de dígito verificador de CPF) pra uma única função pura compartilhada, reusada tanto pelo VO quanto pelo decorator customizado do `class-validator`, de forma que a regra seja escrita uma vez só, mesmo sendo invocada em dois lugares.

## Regras de negócio ficam aqui, não no Use Case

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

O Use Case só chama `os.aprovarOrcamento()` — ele nunca embute a checagem de transição de status.

## Campos sensíveis: sem getter público do valor bruto

```typescript
export class User {
  private constructor(
    private readonly id: string,
    private readonly hashedPassword: string, // nome explícito — nunca `password`
  ) {}

  async verifyPassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.hashedPassword);
  }
  // sem `get password()` — nada fora da entity consegue ler o hash bruto
}
```

A lógica de autenticação chama `verifyPassword()`; ela nunca precisa ler o hash bruto. Se o Mapper realmente precisar ler pra persistência, exponha um getter com nome explícito (`hashedPassword`), nunca `password` — o próprio nome já deve deixar óbvio que isso não é seguro pra colocar num Response DTO. Ver [DTO](dto.md) pra a regra de whitelist do lado de resposta, que é a rede de segurança de fato.

## Nunca importe tipos do Prisma aqui

Traduzir de/para o formato de persistência é trabalho do Mapper (ver [Repository](repository.md)), justamente pra manter o domain independente de framework/ORM.
