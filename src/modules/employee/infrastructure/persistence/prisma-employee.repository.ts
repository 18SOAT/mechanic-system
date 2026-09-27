import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service.js';
import { Employee } from '../../domain/entities/employee.entity.js';
import { EmployeeRepository } from '../../domain/repositories/employee.repository.js';
import { EmployeeMapper } from './employee.mapper.js';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Employee | null> {
    const record = await this.prisma.employee.findUnique({ where: { userId } });
    return record ? EmployeeMapper.toEntity(record) : null;
  }
}
