# Error handling

## `DomainError` must be a class, not an interface

```typescript
// shared/domain/errors/domain.error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
}
```

TypeScript interfaces are erased at compile time — `instanceof` (and Nest's `@Catch()`) need a real runtime type. An `abstract class` gives the same "every subclass must implement this" guarantee as an interface, while still existing at runtime.

## Catalog per module

One class per module/bounded context, with a private constructor and one named static factory per specific error — not a generic `new SomeError(code, message)` call scattered everywhere:

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

Use Cases throw via the catalog: `throw CustomerError.notFound(document)`. See [Catalog pattern](catalog-pattern.md) — this same shape repeats for Mailers and cache keys.

## Global filter maps `code` → HTTP status

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
      // Unmapped code = programming mistake, not a business error.
      // Fail loud (500) instead of silently guessing a status.
      throw exception;
    }

    const res = host.switchToHttp().getResponse<Response>();
    res.status(status).json({ data: null, message: exception.message, status });
  }
}
```

**Rule: every new `XxxError` needs an entry in `STATUS_MAP`.** The filter fails loud (rethrows, becomes an unhandled 500) instead of silently defaulting to some status when a `code` isn't found — fail-safe, not fail-open. Never give this map a silent fallback like `?? HttpStatus.BAD_REQUEST`; that would turn a forgotten mapping (e.g. a real conflict) into a wrong status instead of a visible bug.

## Success envelope: `ResponseInterceptor`

```typescript
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(map((result) => ({ data: result, message: undefined, status: res.statusCode })));
  }
}
```

Controllers just return raw data; this global interceptor builds the `{data, message, status}` envelope. Neither the Interceptor nor the Filter is "middleware" — Nest middleware runs before the route handler and can't access its return value or catch its exceptions. This is specifically an Interceptor (success path) + Exception Filter (error path).
