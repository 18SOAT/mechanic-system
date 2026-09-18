# Tratamento de erros

## `DomainError` precisa ser uma classe, não uma interface

```typescript
// shared/domain/errors/domain.error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
}
```

Interfaces do TypeScript são apagadas em tempo de compilação — `instanceof` (e o `@Catch()` do Nest) precisam de um tipo real em runtime. Uma `abstract class` dá a mesma garantia de "toda subclasse precisa implementar isso" que uma interface daria, mas continua existindo em runtime.

## Catalog por módulo

Uma classe por módulo/bounded context, com constructor privado e uma factory estática nomeada por erro específico — não uma chamada genérica `new SomeError(code, message)` espalhada por todo lugar:

```typescript
// modules/customer/domain/errors/customer.error.ts
export enum CustomerErrorCode {
  NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  DOCUMENT_ALREADY_IN_USE = 'CUSTOMER_DOCUMENT_ALREADY_IN_USE',
}

export class CustomerError extends DomainError {
  private constructor(readonly code: CustomerErrorCode, message: string) {
    super(message);
  }

  static notFound(document: string): CustomerError {
    return new CustomerError(CustomerErrorCode.NOT_FOUND, `Cliente com documento ${document} não encontrado.`);
  }

  static documentAlreadyInUse(document: string): CustomerError {
    return new CustomerError(
      CustomerErrorCode.DOCUMENT_ALREADY_IN_USE,
      `Documento ${document} já está em uso.`,
    );
  }
}
```

Use Cases lançam via o catalog: `throw CustomerError.notFound(document)`. Ver [Padrão catalog](catalog-pattern.md) — esse mesmo formato se repete pra Mailers e chaves de cache.

## Filter global mapeia `code` → status HTTP

```typescript
const STATUS_MAP: Record<string, HttpStatus> = {
  CUSTOMER_NOT_FOUND: HttpStatus.NOT_FOUND,
  CUSTOMER_DOCUMENT_ALREADY_IN_USE: HttpStatus.CONFLICT,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const status = STATUS_MAP[exception.code];

    if (!status) {
      // Code sem mapeamento = erro de programação, não erro de negócio.
      // Falha alto (500) em vez de adivinhar um status silenciosamente.
      throw exception;
    }

    const res = host.switchToHttp().getResponse<Response>();
    res.status(status).json({ data: null, message: exception.message, status });
  }
}
```

**Regra: todo `XxxError` novo precisa de uma entrada no `STATUS_MAP`.** O filter falha alto (relança, vira um 500 não tratado) em vez de cair silenciosamente num status padrão quando um `code` não é encontrado — fail-safe, não fail-open. Nunca dê a esse map um fallback silencioso tipo `?? HttpStatus.BAD_REQUEST`; isso transformaria um mapeamento esquecido (ex: um conflito de verdade) num status errado em vez de um bug visível.

## Envelope de sucesso: `ResponseInterceptor`

```typescript
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(map((result) => ({ data: result, message: undefined, status: res.statusCode })));
  }
}
```

Controllers só retornam dado bruto; esse interceptor global constrói o envelope `{data, message, status}`. Nem o Interceptor nem o Filter são "middleware" — middleware do Nest roda antes do route handler e não consegue acessar o valor de retorno nem capturar suas exceptions. Isso é especificamente um Interceptor (caminho de sucesso) + Exception Filter (caminho de erro).
