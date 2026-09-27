import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port.js';
import { USER_REPOSITORY } from './domain/repositories/user.repository.js';
import { BcryptPasswordHasher } from './infrastructure/hashing/bcrypt-password-hasher.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';

@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER],
})
export class UserModule {}
