import { UnauthorizedException } from '@nestjs/common';
import {
  makeCustomer,
  makeUser,
} from '../../../../../test/fakes/auth-fixtures.js';
import { InMemoryCustomerRepository } from '../../../../../test/fakes/in-memory-customer.repository.js';
import { InMemoryEmployeeRepository } from '../../../../../test/fakes/in-memory-employee.repository.js';
import { InMemoryUserRepository } from '../../../../../test/fakes/in-memory-user.repository.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import { AuthClaimsResolver } from '../services/auth-claims.resolver.js';
import { GetMeUseCase } from './get-me.use-case.js';

describe('GetMeUseCase', () => {
  let users: InMemoryUserRepository;
  let customers: InMemoryCustomerRepository;
  let useCase: GetMeUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    customers = new InMemoryCustomerRepository();
    useCase = new GetMeUseCase(
      users,
      new AuthClaimsResolver(customers, new InMemoryEmployeeRepository()),
    );
  });

  it('retorna os claims atuais, lidos do banco', async () => {
    users.items.push(makeUser());
    customers.items.push(makeCustomer('user-1'));

    await expect(useCase.execute('user-1')).resolves.toStrictEqual({
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });
  });

  it('rejeita usuário removido, desativado ou sem perfil depois da emissão do token', async () => {
    await expect(useCase.execute('user-1')).rejects.toThrow(
      UnauthorizedException,
    );

    users.items.push(makeUser());
    await expect(useCase.execute('user-1')).rejects.toThrow(
      UnauthorizedException,
    );

    users.items[0] = makeUser({ active: false });
    customers.items.push(makeCustomer('user-1'));
    await expect(useCase.execute('user-1')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
