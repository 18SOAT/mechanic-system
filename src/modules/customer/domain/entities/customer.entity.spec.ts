import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Document } from '../value-objects/document.vo.js';
import { Phone } from '../value-objects/phone.vo.js';
import { Customer } from './customer.entity.js';

describe('Customer', () => {
  it('create gera id, vincula ao user e deixa o nome pra depois', () => {
    const customer = Customer.create({
      userId: 'user-1',
      document: Document.create('529.982.247-25'),
      email: Email.create('joao@oficina.com'),
      phone: Phone.create('(11) 98765-4321'),
    });

    expect(customer.idValue).toBeTruthy();
    expect(customer.userIdValue).toBe('user-1');
    expect(customer.nameValue).toBeNull();
  });

  it('restore reconstrói cliente sem login e sem telefone (cadastrado no balcão)', () => {
    const customer = Customer.restore({
      id: 'customer-1',
      userId: null,
      name: 'João Silva',
      document: '11222333000181',
      email: 'joao@oficina.com',
      phone: null,
    });

    expect(customer.idValue).toBe('customer-1');
    expect(customer.userIdValue).toBeNull();
    expect(customer.nameValue).toBe('João Silva');
    expect(customer.documentValue).toBe('11222333000181');
    expect(customer.emailValue).toBe('joao@oficina.com');
    expect(customer.phoneValue).toBeNull();
  });
});
