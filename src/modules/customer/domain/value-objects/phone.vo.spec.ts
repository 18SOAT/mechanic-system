import { Phone } from './phone.vo.js';

describe('Phone', () => {
  it('aceita celular (11 dígitos) e fixo (10), normalizando a máscara', () => {
    expect(Phone.create('(11) 98765-4321').value).toBe('11987654321');
    expect(Phone.create('11 3456-7890').value).toBe('1134567890');
  });

  it('lança erro sem DDD ou com dígitos a mais', () => {
    expect(() => Phone.create('98765-4321')).toThrow();
    expect(() => Phone.create('119876543210')).toThrow();
  });
});
