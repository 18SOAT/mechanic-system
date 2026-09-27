import { Module } from '@nestjs/common';
import { EMPLOYEE_REPOSITORY } from './domain/repositories/employee.repository.js';
import { PrismaEmployeeRepository } from './infrastructure/persistence/prisma-employee.repository.js';

@Module({
  providers: [
    { provide: EMPLOYEE_REPOSITORY, useClass: PrismaEmployeeRepository },
  ],
  exports: [EMPLOYEE_REPOSITORY],
})
export class EmployeeModule {}
