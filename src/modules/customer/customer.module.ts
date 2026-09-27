import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.js';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository.js';

@Module({
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
