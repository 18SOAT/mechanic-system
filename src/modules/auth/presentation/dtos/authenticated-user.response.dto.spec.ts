import { EmployeeRole } from '../../../employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import { AuthenticatedUserResponseDto } from './authenticated-user.response.dto.js';

describe('AuthenticatedUserResponseDto', () => {
  it('CUSTOMER: expõe sub como id e não inclui campos de funcionário', () => {
    const dto = AuthenticatedUserResponseDto.fromClaims({
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });

    expect(JSON.parse(JSON.stringify(dto))).toStrictEqual({
      id: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    });
  });

  it('EMPLOYEE: inclui employeeId e role, sem customerId', () => {
    const dto = AuthenticatedUserResponseDto.fromClaims({
      sub: 'user-2',
      email: 'maria@oficina.com',
      type: UserType.EMPLOYEE,
      employeeId: 'employee-1',
      role: EmployeeRole.ADMIN,
    });

    expect(JSON.parse(JSON.stringify(dto))).toStrictEqual({
      id: 'user-2',
      email: 'maria@oficina.com',
      type: UserType.EMPLOYEE,
      employeeId: 'employee-1',
      role: EmployeeRole.ADMIN,
    });
  });
});
