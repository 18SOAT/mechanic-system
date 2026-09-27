// Função pura com o algoritmo de dígito verificador de CPF/CNPJ. É a única fonte da
// regra: usada pelo VO Document (invariante de domínio) e pelo decorator @IsCpfCnpj
// (borda HTTP). Recebe só dígitos.

function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce(
    (acc, weight, i) => acc + Number(digits[i]) * weight,
    0,
  );
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function isAllSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || isAllSameDigit(digits)) {
    return false;
  }
  const first = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(digits[9]) && second === Number(digits[10]);
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || isAllSameDigit(digits)) {
    return false;
  }
  const first = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(digits[12]) && second === Number(digits[13]);
}

export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

// Aceita com ou sem máscara (123.456.789-09 / 12.345.678/0001-95).
export function isValidDocument(raw: string): boolean {
  const digits = onlyDigits(raw);
  return digits.length === 11 ? isValidCpf(digits) : isValidCnpj(digits);
}
