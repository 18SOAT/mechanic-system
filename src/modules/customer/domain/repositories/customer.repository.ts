import { Customer } from '../entities/customer.entity.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  findByDocument(document: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
}
