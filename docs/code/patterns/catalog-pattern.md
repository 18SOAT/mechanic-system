# Padrão catalog

Um formato recorrente nessa base de código: **uma classe por módulo agindo como catálogo, com um método de factory estático por variante específica** (geralmente baseado em um enum), em vez de um método genérico que recebe um parâmetro de "tipo".

## Onde aparece

| Preocupação | Classe catalog | Exemplo de variante |
|---|---|---|
| Erros de domínio | `CustomerError` | `.notFound()`, `.documentAlreadyInUse()` — ver [Tratamento de erros](error-handling.md) |
| Email | `ServiceOrderMailer` | `.sendStatusUpdated()`, `.sendQuoteApproved()` — ver [infra/email.md](../infra/email.md) |
| Chaves de cache | `ServiceOrderCacheKeys` | `.statusSnapshot(id)`, `.averageExecutionTime()` — ver [infra/cache.md](../infra/cache.md) |

## Por que não um método de dispatch genérico

Um único método como `mailer.send(EmailType.STATUS_UPDATED, data)` força `data` a ter um formato genérico/union, perdendo type safety por chamada (nada garante que `data` tenha os campos certos pra aquele `EmailType` específico), prejudica o autocomplete, e dificulta testar uma variante isoladamente. Um método dedicado por variante mantém cada ponto de chamada totalmente tipado e transforma a própria classe num catálogo navegável de "tudo que esse módulo pode fazer" naquela categoria.

## O formato

```typescript
export class XxxCatalog {
  private constructor(/* ... */) {}

  static variantOne(params: SpecificParamsA): XxxCatalog { /* ... */ }
  static variantTwo(params: SpecificParamsB): XxxCatalog { /* ... */ }
}
```

Aplique esse formato sempre que surgir uma necessidade nova de "uma classe produzindo várias coisas nomeadas e estruturalmente diferentes pra um módulo" (ex: um futuro catalog de notificações, um catalog de audit-log) — não reinvente a decisão do zero toda vez.
