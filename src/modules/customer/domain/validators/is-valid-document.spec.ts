import {
  isValidCnpj,
  isValidCpf,
  isValidDocument,
  onlyDigits,
} from './is-valid-document.js';

describe('is-valid-document', () => {
  describe('isValidCpf', () => {
    it('aceita CPF com dígitos verificadores corretos', () => {
      expect(isValidCpf('52998224725')).toBe(true);
    });

    it('rejeita CPF com dígito verificador errado', () => {
      expect(isValidCpf('52998224726')).toBe(false);
    });

    it('rejeita sequência de dígitos repetidos (passa no checksum, mas é inválido)', () => {
      expect(isValidCpf('11111111111')).toBe(false);
    });

    it('rejeita tamanho diferente de 11', () => {
      expect(isValidCpf('5299822472')).toBe(false);
    });
  });

  describe('isValidCnpj', () => {
    it('aceita CNPJ com dígitos verificadores corretos', () => {
      expect(isValidCnpj('11222333000181')).toBe(true);
    });

    it('rejeita CNPJ com dígito verificador errado', () => {
      expect(isValidCnpj('11222333000182')).toBe(false);
    });

    it('rejeita sequência de dígitos repetidos', () => {
      expect(isValidCnpj('00000000000000')).toBe(false);
    });
  });

  describe('isValidDocument', () => {
    it('aceita CPF e CNPJ com máscara', () => {
      expect(isValidDocument('529.982.247-25')).toBe(true);
      expect(isValidDocument('11.222.333/0001-81')).toBe(true);
    });

    it('rejeita tamanhos que não são CPF nem CNPJ', () => {
      expect(isValidDocument('123')).toBe(false);
    });
  });

  it('onlyDigits remove qualquer caractere não numérico', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
  });
});
