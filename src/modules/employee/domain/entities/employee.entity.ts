import { EmployeeRole } from '../enums/employee-role.enum.js';

// Por enquanto só leitura (restore) — o login precisa do id e do role.
// TODO: create() e regras de negócio quando existir o CRUD de funcionários (feito por ADMIN).
export class Employee {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly name: string,
    private readonly role: EmployeeRole,
  ) {}

  static restore(props: {
    id: string;
    userId: string;
    name: string;
    role: EmployeeRole;
  }): Employee {
    return new Employee(props.id, props.userId, props.name, props.role);
  }

  get idValue(): string {
    return this.id;
  }

  get userIdValue(): string {
    return this.userId;
  }

  get nameValue(): string {
    return this.name;
  }

  get roleValue(): EmployeeRole {
    return this.role;
  }
}
