import { Email } from './email.vo.js';

describe('Email', () => {
  it('normaliza com trim e lowercase', () => {
    expect(Email.create('  Joao@Oficina.COM ').value).toBe('joao@oficina.com');
  });

  it.each(['joao', 'joao@', '@oficina.com', 'joao @oficina.com'])(
    'rejeita "%s"',
    (raw) => {
      expect(() => Email.create(raw)).toThrow('E-mail inválido.');
    },
  );
});
