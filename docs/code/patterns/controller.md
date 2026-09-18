# Controller

Um Controller só traduz HTTP ↔ Use Case. Ele não tem lógica de negócio e nunca fala com um Repository diretamente.

## Responsabilidades

- Receber o request DTO já validado (a validação acontece num `Pipe`, antes do método rodar — ver [DTO](dto.md)).
- Chamar o(s) Use Case(s) específico(s) que a rota precisa.
- Retornar o resultado bruto; o `ResponseInterceptor` global embrulha no envelope padrão (ver [Tratamento de erros](error-handling.md)).
- Opcionalmente mapear o resultado pra um Response DTO antes de retornar (ver [DTO](dto.md)).

## Injete Use Cases diretamente — nunca um "God Service"

Injete só os Use Cases que cada rota realmente precisa, um por operação:

```typescript
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly findCustomerByDocument: FindCustomerByDocumentUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCustomerRequestDto) {
    const customer = await this.createCustomer.execute(dto);
    return CustomerResponseDto.fromEntity(customer);
  }

  @Get(':document')
  async findByDocument(@Param('document') document: string) {
    const customer = await this.findCustomerByDocument.execute(document);
    return CustomerResponseDto.fromEntity(customer);
  }
}
```

## Anti-pattern: service orquestrador

Não crie um `CustomerService` que só delega pra `CreateCustomerUseCase`, `FindCustomerByDocumentUseCase`, etc. Isso recria o "fat service" que a separação em Use Case foi criada pra evitar: toda rota acaba dependendo de todo Use Case do módulo, e a camada extra não agrega valor.

Um Use Case pode chamar outro Use Case — mas só quando existe uma dependência de negócio real (ex: criar uma `OrdemServico` precisa criar o `Veiculo` primeiro, se ele ainda não existir), nunca como uma passagem genérica. Ver [Use Case](use-case.md).
