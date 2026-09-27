import { BadRequestException, ConflictException } from '@nestjs/common';
import { FakePasswordHasher } from '../../../../../test/fakes/fake-password-hasher.js';
import { InMemoryCustomerRepository } from '../../../../../test/fakes/in-memory-customer.repository.js';
import { InMemoryCustomerRegistrationRepository } from '../../../../../test/fakes/in-memory-customer-registration.repository.js';
import { InMemoryUserRepository } from '../../../../../test/fakes/in-memory-user.repository.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import {
  type RegisterCustomerInput,
  RegisterCustomerUseCase,
} from './register-customer.use-case.js';

describe('RegisterCustomerUseCase', () => {
  let users: InMemoryUserRepository;
  let customers: InMemoryCustomerRepository;
  let useCase: RegisterCustomerUseCase;

  const input: RegisterCustomerInput = {
    email: 'Joao@Oficina.com',
    password: 'senha-forte',
    document: '529.982.247-25',
    phone: '(11) 98765-4321',
  };

  beforeEach(() => {
    users = new InMemoryUserRepository();
    customers = new InMemoryCustomerRepository();
    useCase = new RegisterCustomerUseCase(
      users,
      customers,
      new InMemoryCustomerRegistrationRepository(users, customers),
      new FakePasswordHasher(),
    );
  });

  it('cria User CUSTOMER e Customer vinculados, com dados normalizados', async () => {
    const user = await useCase.execute(input);

    expect(user.emailValue).toBe('joao@oficina.com');
    expect(user.typeValue).toBe(UserType.CUSTOMER);
    expect(user.hashedPassword).toBe('hashed:senha-forte');

    const [customer] = customers.items;
    expect(customer.userIdValue).toBe(user.idValue);
    expect(customer.documentValue).toBe('52998224725');
    expect(customer.phoneValue).toBe('11987654321');
    expect(customer.nameValue).toBeNull();
  });

  it('rejeita e-mail já cadastrado (comparação normalizada)', async () => {
    await useCase.execute(input);

    await expect(
      useCase.execute({
        ...input,
        email: 'JOAO@oficina.com',
        document: '11222333000181',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejeita CPF/CNPJ já cadastrado, mesmo com máscara diferente', async () => {
    await useCase.execute(input);

    await expect(
      useCase.execute({
        ...input,
        email: 'outro@oficina.com',
        document: '52998224725',
      }),
    ).rejects.toThrow('CPF/CNPJ já cadastrado.');
  });

  it('rejeita senha fraca sem gravar nada', async () => {
    await expect(
      useCase.execute({ ...input, password: '123' }),
    ).rejects.toThrow(BadRequestException);
    expect(users.items).toHaveLength(0);
    expect(customers.items).toHaveLength(0);
  });
});
