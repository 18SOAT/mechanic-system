import type { Customer } from '../../src/modules/customer/domain/entities/customer.entity.js';
import type { CustomerRepository } from '../../src/modules/customer/domain/repositories/customer.repository.js';

export class InMemoryCustomerRepository implements CustomerRepository {
  readonly items: Customer[] = [];

  async findByDocument(document: string): Promise<Customer | null> {
    return (
      this.items.find((customer) => customer.documentValue === document) ?? null
    );
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return (
      this.items.find((customer) => customer.userIdValue === userId) ?? null
    );
  }
}
