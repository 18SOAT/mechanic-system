import type { CustomerRegistrationRepository } from '../../src/modules/auth/domain/ports/customer-registration.repository.js';
import type { Customer } from '../../src/modules/customer/domain/entities/customer.entity.js';
import type { User } from '../../src/modules/user/domain/entities/user.entity.js';
import type { InMemoryCustomerRepository } from './in-memory-customer.repository.js';
import type { InMemoryUserRepository } from './in-memory-user.repository.js';

// Grava nos dois repositórios in-memory, simulando a transação do adapter Prisma.
export class InMemoryCustomerRegistrationRepository
  implements CustomerRegistrationRepository
{
  constructor(
    private readonly users: InMemoryUserRepository,
    private readonly customers: InMemoryCustomerRepository,
  ) {}

  async register(user: User, customer: Customer): Promise<void> {
    this.users.items.push(user);
    this.customers.items.push(customer);
  }
}
