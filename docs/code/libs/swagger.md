# Swagger

## Request DTOs

Decore cada campo com `@ApiProperty()` junto com os decorators do `class-validator` (ver [DTO](../patterns/dto.md)):

```typescript
export class CreateCustomerRequestDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;
}
```

## O envelope de resposta é invisível pro Swagger — declare explicitamente

O `ResponseInterceptor` (ver [Tratamento de erros](../patterns/error-handling.md)) constrói `{data, message, status}` em runtime. O Swagger gera a documentação a partir de decorators/reflection estáticos — ele não sabe que o Interceptor existe, então um `@ApiOkResponse({ type: CustomerResponseDto })` simples documentaria a resposta como o DTO puro, não como o formato real do envelope.

Construa um decorator reutilizável em vez de repetir o schema do envelope em cada rota:

```typescript
// shared/infrastructure/http/decorators/api-standard-response.decorator.ts
export const ApiStandardResponse = <TModel extends Type<unknown>>(model: TModel, status: HttpStatus) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
          message: { type: 'string', nullable: true },
          status: { type: 'number', example: status },
        },
      },
    }),
  );
```

```typescript
@Post()
@ApiStandardResponse(CustomerResponseDto, HttpStatus.CREATED)
async create(@Body() dto: CreateCustomerRequestDto) { /* ... */ }
```

## Erros nunca são inferidos — TypeScript não tem checked exceptions

O Swagger não tem como saber o que um Use Case pode lançar. Quem escreve o método do Controller precisa declarar manualmente cada resposta de erro possível daquela rota, com base no que seus Use Case(s) podem lançar:

```typescript
@ApiResponse({ status: HttpStatus.CONFLICT, description: 'CPF/CNPJ já cadastrado.', type: ApiErrorResponseDto })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.', type: ApiErrorResponseDto })
```

## Um único DTO de erro compartilhado pra API inteira

Como todo `DomainError` produz o mesmo formato (`{data: null, message, status}`), um único `ApiErrorResponseDto` cobre todos eles — só o status HTTP e o texto de descrição variam por rota:

```typescript
export class ApiErrorResponseDto {
  @ApiProperty({ example: null }) data: null;
  @ApiProperty({ example: 'Cliente com documento 123.456.789-00 já cadastrado.' }) message: string;
  @ApiProperty({ example: 409 }) status: number;
}
```

## Futuramente: o plugin de CLI do Swagger

O plugin de CLI do `@nestjs/swagger` (configurado em `nest-cli.json`) consegue autogerar boa parte do boilerplate de `@ApiProperty()` a partir dos tipos e comentários do TypeScript. Vale habilitar quando o número de DTOs crescer, pra reduzir a decoração manual.
