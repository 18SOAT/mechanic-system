import {
  Prisma,
  Customer as PrismaCustomer,
} from '../../../../generated/prisma/client.js';
import { Customer } from '../../domain/entities/customer.entity.js';

export class CustomerMapper {
  static toEntity(record: PrismaCustomer): Customer {
    return Customer.restore({
      id: record.id,
      userId: record.userId,
      name: record.name,
      document: record.document,
      email: record.email,
      phone: record.phone,
    });
  }

  // Unchecked: recebe `userId` como escalar (FK) em vez de `user: { connect }`.
  static toObject(entity: Customer): Prisma.CustomerUncheckedCreateInput {
    return {
      id: entity.idValue,
      userId: entity.userIdValue,
      name: entity.nameValue,
      document: entity.documentValue,
      email: entity.emailValue,
      phone: entity.phoneValue,
    };
  }
}
