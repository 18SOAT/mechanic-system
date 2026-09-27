import { Document } from './document.vo.js';

describe('Document', () => {
  it('normaliza pra só dígitos', () => {
    expect(Document.create('529.982.247-25').value).toBe('52998224725');
  });

  it('identifica CPF e CNPJ', () => {
    expect(Document.create('52998224725').isCpf).toBe(true);
    expect(Document.create('11222333000181').isCpf).toBe(false);
  });

  it('lança erro pra documento inválido', () => {
    expect(() => Document.create('123.456.789-00')).toThrow(
      'CPF/CNPJ inválido.',
    );
  });
});
