# Email

## Generic port

```typescript
// shared/infrastructure/email/email-sender.port.ts
export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  send(params: { to: string; subject: string; body: string }): Promise<void>;
}
```

```typescript
// shared/infrastructure/email/nodemailer-email.service.ts
@Injectable()
export class NodemailerEmailService implements EmailSender {
  async send(params: { to: string; subject: string; body: string }): Promise<void> {
    // vendor-specific (Nodemailer/SES/Resend/...) call
  }
}
```

```typescript
// shared/infrastructure/email/email.module.ts
@Global()
@Module({
  providers: [{ provide: EMAIL_SENDER, useClass: NodemailerEmailService }],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
```

This generic port only knows "send an email" — it has no idea what a status-update notification is. See [services-pattern.md](services-pattern.md) for the general recipe.

## Per-module Mailer (catalog pattern)

Business-specific emails (with their templates) live in a per-module Mailer, one method per email type — see [Catalog pattern](../patterns/catalog-pattern.md):

```typescript
// modules/ordem-servico/infrastructure/mailers/ordem-servico.mailer.ts
@Injectable()
export class OrdemServicoMailer {
  constructor(@Inject(EMAIL_SENDER) private readonly emailSender: EmailSender) {}

  async sendStatusUpdated(params: { to: string; customerName: string; placa: string; newStatus: string }) {
    const html = renderTemplate('ordem-servico-status-updated', params);
    await this.emailSender.send({ to: params.to, subject: 'Atualização da sua Ordem de Serviço', body: html });
  }

  async sendOrcamentoApproved(params: { to: string; customerName: string; valor: number }) {
    const html = renderTemplate('ordem-servico-orcamento-aprovado', params);
    await this.emailSender.send({ to: params.to, subject: 'Orçamento aprovado', body: html });
  }
}
```

**Don't** build a single generic `mailer.send(EmailType.STATUS_UPDATED, data)` method — see [Catalog pattern](../patterns/catalog-pattern.md) for why (loses per-call type safety, harder to test, less self-documenting).

A Use Case injects the specific Mailer it needs, calls the named method, and never touches template rendering or the generic `EmailSender` directly.
