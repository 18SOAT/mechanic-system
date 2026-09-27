import {
  makeCustomer,
  makeEmployee,
  makeUser,
} from '../../../../../test/fakes/auth-fixtures.js';
import { InMemoryCustomerRepository } from '../../../../../test/fakes/in-memory-customer.repository.js';
import { InMemoryEmployeeRepository } from '../../../../../test/fakes/in-memory-employee.repository.js';
import { EmployeeRole } from '../../../employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import { AuthClaimsResolver } from './auth-claims.resolver.js';

describe('AuthClaimsResolver', () => {
  let customers: InMemoryCustomerRepository;
  let employees: InMemoryEmployeeRepository;
  let resolver: AuthClaimsResolver;

  beforeEach(() => {
    customers = new InMemoryCustomerRepository();
    employees = new InMemoryEmployeeRepository();
    resolver = new AuthClaimsResolver(customers, employees);
  });

  it('CUSTOMER: sub, email, type e customerId — sem CPF nem telefone', async () => {
    customers.items.push(makeCustomer('user-1'));

    const claims = await resolver.resolve(makeUser());

    expect(claims).toStrictEqual({
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });
  });

  it('EMPLOYEE: sub, email, type, employeeId e role', async () => {
    employees.items.push(makeEmployee('user-2', EmployeeRole.ADMIN));

    const claims = await resolver.resolve(
      makeUser({
        id: 'user-2',
        email: 'maria@oficina.com',
        type: UserType.EMPLOYEE,
      }),
    );

    expect(claims).toStrictEqual({
      sub: 'user-2',
      email: 'maria@oficina.com',
      type: UserType.EMPLOYEE,
      employeeId: 'employee-1',
      role: EmployeeRole.ADMIN,
    });
  });

  it('retorna null quando o User não tem perfil vinculado', async () => {
    await expect(resolver.resolve(makeUser())).resolves.toBeNull();
    await expect(
      resolver.resolve(makeUser({ type: UserType.EMPLOYEE })),
    ).resolves.toBeNull();
  });
});
