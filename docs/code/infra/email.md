# Email

## Port genérica

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
    // chamada específica do vendor (Nodemailer/SES/Resend/...)
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

Essa port genérica só sabe "enviar um email" — ela não faz ideia do que é uma notificação de atualização de status. Ver [services-pattern.md](services-pattern.md) pra a receita geral.

## Mailer por módulo (padrão catalog)

Emails específicos de negócio (com seus templates) ficam num Mailer por módulo, um método por tipo de email — ver [Padrão catalog](../patterns/catalog-pattern.md):

```typescript
// modules/service-order/infrastructure/mailers/service-order.mailer.ts
@Injectable()
export class ServiceOrderMailer {
  constructor(@Inject(EMAIL_SENDER) private readonly emailSender: EmailSender) {}

  async sendStatusUpdated(params: { to: string; customerName: string; plate: string; newStatus: string }) {
    const html = renderTemplate('service-order-status-updated', params);
    await this.emailSender.send({ to: params.to, subject: 'Atualização da sua Ordem de Serviço', body: html });
  }

  async sendQuoteApproved(params: { to: string; customerName: string; amount: number }) {
    const html = renderTemplate('service-order-quote-approved', params);
    await this.emailSender.send({ to: params.to, subject: 'Orçamento aprovado', body: html });
  }
}
```

**Não** construa um único método genérico `mailer.send(EmailType.STATUS_UPDATED, data)` — ver [Padrão catalog](../patterns/catalog-pattern.md) pro motivo (perde type safety por chamada, fica mais difícil de testar, menos autoexplicativo).

Um Use Case injeta o Mailer específico que precisa, chama o método nomeado, e nunca toca na renderização de template nem na `EmailSender` genérica diretamente.
