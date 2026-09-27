import { onlyDigits } from '../validators/is-valid-document.js';

// Telefone brasileiro: DDD + número, 10 (fixo) ou 11 (celular) dígitos, sem máscara.
export class Phone {
  private constructor(readonly value: string) {}

  static create(raw: string): Phone {
    const digits = onlyDigits(raw);
    if (!/^\d{10,11}$/.test(digits)) {
      throw new Error('Telefone inválido. Informe DDD + número.');
    }
    return new Phone(digits);
  }
}
