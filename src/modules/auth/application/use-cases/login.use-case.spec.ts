import { UnauthorizedException } from '@nestjs/common';
import {
  makeCustomer,
  makeEmployee,
  makeUser,
} from '../../../../../test/fakes/auth-fixtures.js';
import { FakePasswordHasher } from '../../../../../test/fakes/fake-password-hasher.js';
import { FakeTokenService } from '../../../../../test/fakes/fake-token-service.js';
import { InMemoryCustomerRepository } from '../../../../../test/fakes/in-memory-customer.repository.js';
import { InMemoryEmployeeRepository } from '../../../../../test/fakes/in-memory-employee.repository.js';
import { InMemoryUserRepository } from '../../../../../test/fakes/in-memory-user.repository.js';
import { EmployeeRole } from '../../../employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import { AuthClaimsResolver } from '../services/auth-claims.resolver.js';
import { LoginUseCase } from './login.use-case.js';

describe('LoginUseCase', () => {
  let users: InMemoryUserRepository;
  let customers: InMemoryCustomerRepository;
  let employees: InMemoryEmployeeRepository;
  let hasher: FakePasswordHasher;
  let tokens: FakeTokenService;
  let useCase: LoginUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    customers = new InMemoryCustomerRepository();
    employees = new InMemoryEmployeeRepository();
    hasher = new FakePasswordHasher();
    tokens = new FakeTokenService();
    useCase = new LoginUseCase(
      users,
      hasher,
      tokens,
      new AuthClaimsResolver(customers, employees),
    );
  });

  it('CUSTOMER: devolve o user e o token com exatamente os mesmos claims', async () => {
    users.items.push(makeUser());
    customers.items.push(makeCustomer('user-1'));

    const result = await useCase.execute({
      email: ' Joao@Oficina.com ',
      password: 'senha-forte',
    });

    expect(result.user).toStrictEqual({
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });
    await expect(tokens.verify(result.accessToken)).resolves.toStrictEqual(
      result.user,
    );
  });

  it('EMPLOYEE: token carrega employeeId e role', async () => {
    users.items.push(makeUser({ type: UserType.EMPLOYEE }));
    employees.items.push(makeEmployee('user-1', EmployeeRole.ADMIN));

    const { accessToken } = await useCase.execute({
      email: 'joao@oficina.com',
      password: 'senha-forte',
    });

    await expect(tokens.verify(accessToken)).resolves.toMatchObject({
      type: UserType.EMPLOYEE,
      employeeId: 'employee-1',
      role: EmployeeRole.ADMIN,
    });
  });

  it('rejeita senha errada com mensagem genérica', async () => {
    users.items.push(makeUser());
    customers.items.push(makeCustomer('user-1'));

    await expect(
      useCase.execute({ email: 'joao@oficina.com', password: 'senha-errada' }),
    ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas.'));
  });

  it('e-mail inexistente: mesma mensagem E ainda executa o compare (anti-timing)', async () => {
    await expect(
      useCase.execute({ email: 'ninguem@oficina.com', password: 'qualquer' }),
    ).rejects.toThrow('Credenciais inválidas.');
    expect(hasher.compareCalls).toBe(1);
  });

  it('rejeita usuário inativo mesmo com a senha certa', async () => {
    users.items.push(makeUser({ active: false }));
    customers.items.push(makeCustomer('user-1'));

    await expect(
      useCase.execute({ email: 'joao@oficina.com', password: 'senha-forte' }),
    ).rejects.toThrow('Credenciais inválidas.');
  });

  it('rejeita User sem perfil vinculado (sem Customer/Employee)', async () => {
    users.items.push(makeUser());

    await expect(
      useCase.execute({ email: 'joao@oficina.com', password: 'senha-forte' }),
    ).rejects.toThrow('Credenciais inválidas.');
  });
});
