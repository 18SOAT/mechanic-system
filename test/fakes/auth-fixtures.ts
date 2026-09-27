import { Customer } from '../../src/modules/customer/domain/entities/customer.entity.js';
import { Employee } from '../../src/modules/employee/domain/entities/employee.entity.js';
import { EmployeeRole } from '../../src/modules/employee/domain/enums/employee-role.enum.js';
import { User } from '../../src/modules/user/domain/entities/user.entity.js';
import { UserType } from '../../src/modules/user/domain/enums/user-type.enum.js';

// Senha de todos os fixtures: 'senha-forte' (formato do FakePasswordHasher).
export const makeUser = (
  overrides: Partial<{
    id: string;
    email: string;
    type: UserType;
    active: boolean;
  }> = {},
) =>
  User.restore({
    id: 'user-1',
    email: 'joao@oficina.com',
    hashedPassword: 'hashed:senha-forte',
    type: UserType.CUSTOMER,
    active: true,
    ...overrides,
  });

export const makeCustomer = (userId: string) =>
  Customer.restore({
    id: 'customer-1',
    userId,
    name: null,
    document: '52998224725',
    email: 'joao@oficina.com',
    phone: '11987654321',
  });

export const makeEmployee = (userId: string, role = EmployeeRole.MECHANIC) =>
  Employee.restore({ id: 'employee-1', userId, name: 'Maria', role });
