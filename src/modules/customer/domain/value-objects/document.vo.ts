import {
  isValidDocument,
  onlyDigits,
} from '../validators/is-valid-document.js';

// TODO: trocar os `throw new Error` dos VOs por CustomerError (DomainError) + DomainExceptionFilter.
// CPF (11 dígitos) ou CNPJ (14), persistido só com dígitos.
export class Document {
  private constructor(readonly value: string) {}

  static create(raw: string): Document {
    if (!isValidDocument(raw)) {
      throw new Error('CPF/CNPJ inválido.');
    }
    return new Document(onlyDigits(raw));
  }

  get isCpf(): boolean {
    return this.value.length === 11;
  }
}
