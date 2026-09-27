import { Employee } from '../entities/employee.entity.js';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
  findByUserId(userId: string): Promise<Employee | null>;
}
