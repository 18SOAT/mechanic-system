import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service.js';
import { Customer } from '../../../customer/domain/entities/customer.entity.js';
import { CustomerMapper } from '../../../customer/infrastructure/persistence/customer.mapper.js';
import { User } from '../../../user/domain/entities/user.entity.js';
import { UserMapper } from '../../../user/infrastructure/persistence/user.mapper.js';
import { CustomerRegistrationRepository } from '../../domain/ports/customer-registration.repository.js';

@Injectable()
export class PrismaCustomerRegistrationRepository
  implements CustomerRegistrationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async register(user: User, customer: Customer): Promise<void> {
    // TODO: mapear P2002 (unique violation) pra erro de domínio — cobre a corrida entre
    // o check de unicidade do use case e este insert.
    await this.prisma.$transaction([
      this.prisma.user.create({ data: UserMapper.toObject(user) }),
      this.prisma.customer.create({ data: CustomerMapper.toObject(customer) }),
    ]);
  }
}
