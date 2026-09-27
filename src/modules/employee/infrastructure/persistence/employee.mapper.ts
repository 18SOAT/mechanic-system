import type { Employee as PrismaEmployee } from '../../../../generated/prisma/client.js';
import { Employee } from '../../domain/entities/employee.entity.js';
import { EmployeeRole } from '../../domain/enums/employee-role.enum.js';

export class EmployeeMapper {
  static toEntity(record: PrismaEmployee): Employee {
    return Employee.restore({
      id: record.id,
      userId: record.userId,
      name: record.name,
      role: record.role as EmployeeRole,
    });
  }
}
