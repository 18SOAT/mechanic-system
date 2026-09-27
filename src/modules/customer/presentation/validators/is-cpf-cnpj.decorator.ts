import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidDocument } from '../../domain/validators/is-valid-document.js';

// Borda HTTP: rejeita com 400 antes do use case. Mesma função pura do VO Document.
export function IsCpfCnpj(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isCpfCnpj',
      target: target.constructor,
      propertyName,
      options: { message: 'CPF/CNPJ inválido.', ...options },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && isValidDocument(value),
      },
    });
  };
}
