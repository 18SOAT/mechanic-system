// TODO: trocar os `throw new Error` dos VOs por erros de domínio (DomainError) + DomainExceptionFilter.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new Error('E-mail inválido.');
    }
    return new Email(normalized);
  }
}
