// Senha em texto puro, validada ANTES do hash. Nunca é persistida nem logada.
const MIN_LENGTH = 8;
// O bcrypt só considera os primeiros 72 bytes: acima disso, duas senhas diferentes
// com o mesmo prefixo gerariam o mesmo hash. Rejeitar é melhor que truncar calado.
const MAX_BYTES = 72;

export class Password {
  private constructor(readonly value: string) {}

  static create(raw: string): Password {
    if (raw.length < MIN_LENGTH) {
      throw new Error(`A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`);
    }
    if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES) {
      throw new Error(`A senha deve ter no máximo ${MAX_BYTES} bytes.`);
    }
    return new Password(raw);
  }
}
