# Controller

A Controller only translates HTTP ↔ Use Case. It has no business logic and never talks to a Repository directly.

## Responsibilities

- Receive the validated request DTO (validation happens in a `Pipe`, before the method runs — see [DTO](dto.md)).
- Call the specific Use Case(s) that route needs.
- Return the raw result; the global `ResponseInterceptor` wraps it in the standard envelope (see [Error handling](error-handling.md)).
- Optionally map the result to a Response DTO before returning (see [DTO](dto.md)).

## Inject Use Cases directly — never a "God Service"

Inject only the Use Cases each route actually needs, one per operation:

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

## Anti-pattern: orchestrator service

Do not create a `CustomerService` that only delegates to `CreateCustomerUseCase`, `FindCustomerByDocumentUseCase`, etc. That recreates the "fat service" the Use Case split was meant to avoid: every route ends up depending on every Use Case in the module, and the extra layer adds no value.

A Use Case is allowed to call another Use Case — but only when there is a real business dependency (e.g. creating an `OrdemServico` needs to create the `Veiculo` first if it doesn't exist), never as a generic pass-through. See [Use Case](use-case.md).
