import { EmployeeRole } from '../../../modules/employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../modules/user/domain/enums/user-type.enum.js';
import { type AuthTokenPayload, pickAuthClaims } from './token-service.port.js';

describe('pickAuthClaims', () => {
  it('descarta campos fora do contrato (iat/exp, dados sensíveis por engano)', () => {
    const raw = {
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
      iat: 1,
      exp: 2,
      document: '52998224725',
    } as AuthTokenPayload;

    expect(pickAuthClaims(raw)).toStrictEqual({
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });
  });

  it('mantém employeeId e role pra EMPLOYEE', () => {
    const raw: AuthTokenPayload = {
      sub: 'user-2',
      email: 'maria@oficina.com',
      type: UserType.EMPLOYEE,
      employeeId: 'employee-1',
      role: EmployeeRole.MECHANIC,
    };

    expect(pickAuthClaims(raw)).toStrictEqual(raw);
  });
});
