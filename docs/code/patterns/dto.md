# DTO

Existem dois tipos de DTO sem relação entre si, que resolvem problemas diferentes.

## Request DTO — validação de formato na borda HTTP

```typescript
// modules/customer/presentation/dtos/create-customer.request.dto.ts
export class CreateCustomerRequestDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsCpfCnpj()
  document: string;
}
```

Validado por um `Pipe` (`ValidationPipe` + `class-validator`), antes do método do Controller rodar. Ele rejeita payloads malformados rápido, com um HTTP 400 de verdade, antes de qualquer lógica de negócio executar.

### Isso não substitui a validação do Value Object

O Value Object do domain (ver [Entity](entity.md)) continua validando o mesmo tipo de coisa (formato, checksum) — isso não é duplicação desperdiçada, é defesa em profundidade pra duas fronteiras diferentes:

- O `class-validator` no DTO protege a **borda HTTP**.
- O Value Object protege o **invariante de domínio**, garantindo que ele se mantenha não importa qual caminho de código construa a Entity (um consumer de fila, um script, outro Use Case — nenhum desses passa pelo DTO HTTP).

Extraia a checagem de fato (ex: checksum de CPF) pra uma única função pura chamada dos dois lugares, de forma que o algoritmo em si não seja duplicado — só o ponto de chamada.

### Checagens de unicidade não pertencem a nenhum dos dois

"CPF já cadastrado", "email já em uso" exigem uma query no banco — nem o `class-validator` (síncrono, por campo) nem um Value Object (precisa ficar puro, sem I/O) conseguem fazer isso. Isso pertence ao Use Case, via Repository, antes de construir/persistir a Entity.

## Response DTO — sempre uma whitelist

```typescript
// modules/customer/presentation/dtos/customer.response.dto.ts
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

Copie explicitamente só os campos que são seguros pra expor. **Nunca confie numa blacklist** (ex: `@Exclude()` marcando campos sensíveis) como defesa principal — o mesmo risco de "esquecer uma entrada" que evitamos no status map de [Tratamento de erros](error-handling.md) se aplica aqui: um campo sensível novo, adicionado depois, vaza silenciosamente a não ser que alguém lembre de colocar na blacklist. Uma whitelist falha de forma segura — um campo esquecido só fica faltando na resposta, nunca vaza.

Listagens reusam o mesmo DTO via `.map(CustomerResponseDto.fromEntity)`. Só crie um formato de DTO diferente quando o dado exposto realmente for diferente (ex: um item de lista resumido vs. uma visão de detalhe completa).

### Respostas compostas / aninhadas

Quando uma listagem junta dados de vários aggregates (ex: `Vehicle` com seu `Customer` e o `User` do customer), componha um DTO de resposta dedicado na camada de Repository/Mapper. O `select` seletivo do Prisma (buscar só os campos necessários, ex: excluindo `hashedPassword` de uma relação `user` aninhada) é uma boa otimização complementar e uma camada extra de defesa — mas nunca pode ser a *única* defesa, já que precisaria ser repetido corretamente em cada ponto de query. O DTO whitelist continua sendo o checkpoint único obrigatório.

Nota: compor dado aninhado pra uma listagem/resposta é uma preocupação de query/apresentação. Isso não significa que a própria Entity `Vehicle` deva carregar um objeto `Customer` completo como parte do seu limite de consistência — aggregates tipicamente se referenciam só por id.
