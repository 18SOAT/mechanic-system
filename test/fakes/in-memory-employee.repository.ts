import type { Employee } from '../../src/modules/employee/domain/entities/employee.entity.js';
import type { EmployeeRepository } from '../../src/modules/employee/domain/repositories/employee.repository.js';

export class InMemoryEmployeeRepository implements EmployeeRepository {
  readonly items: Employee[] = [];

  async findByUserId(userId: string): Promise<Employee | null> {
    return (
      this.items.find((employee) => employee.userIdValue === userId) ?? null
    );
  }
}
