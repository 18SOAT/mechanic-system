# Swagger

## Request DTOs

Decorate every field with `@ApiProperty()` alongside its `class-validator` decorators (see [DTO](../patterns/dto.md)):

```typescript
export class CreateCustomerRequestDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;
}
```

## The response envelope is invisible to Swagger — declare it explicitly

`ResponseInterceptor` (see [Error handling](../patterns/error-handling.md)) builds `{data, message, status}` at runtime. Swagger generates docs from static decorators/reflection — it has no idea the Interceptor exists, so a plain `@ApiOkResponse({ type: CustomerResponseDto })` would document the response as the bare DTO, not the real envelope shape.

Build one reusable decorator instead of repeating the envelope schema on every route:

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

## Errors are never inferred — TypeScript has no checked exceptions

Swagger cannot know what a Use Case might throw. Whoever writes the Controller method must manually declare every possible error response for that route, based on what its Use Case(s) can throw:

```typescript
@ApiResponse({ status: HttpStatus.CONFLICT, description: 'CPF/CNPJ já cadastrado.', type: ApiErrorResponseDto })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.', type: ApiErrorResponseDto })
```

## One shared error DTO for the whole API

Since every `DomainError` produces the same shape (`{data: null, message, status}`), a single `ApiErrorResponseDto` covers all of them — only the HTTP status and description text vary per route:

```typescript
export class ApiErrorResponseDto {
  @ApiProperty({ example: null }) data: null;
  @ApiProperty({ example: 'Cliente com documento 123.456.789-00 já cadastrado.' }) message: string;
  @ApiProperty({ example: 409 }) status: number;
}
```

## Later: the Swagger CLI plugin

`@nestjs/swagger`'s CLI plugin (configured in `nest-cli.json`) can auto-generate much of the `@ApiProperty()` boilerplate from TypeScript types and comments. Worth enabling once the number of DTOs grows, to cut down manual decoration.
