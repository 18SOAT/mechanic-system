import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { CustomerRepository } from '../../domain/repositories/customer.repository.js';
import { CustomerMapper } from './customer.mapper.js';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDocument(document: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { document },
    });
    return record ? CustomerMapper.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { userId },
    });
    return record ? CustomerMapper.toEntity(record) : null;
  }
}
