import { Module } from '@nestjs/common';
import { CustomerModule } from '../customer/customer.module.js';
import { EmployeeModule } from '../employee/employee.module.js';
import { UserModule } from '../user/user.module.js';
import { AuthClaimsResolver } from './application/services/auth-claims.resolver.js';
import { GetMeUseCase } from './application/use-cases/get-me.use-case.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { RegisterCustomerUseCase } from './application/use-cases/register-customer.use-case.js';
import { CUSTOMER_REGISTRATION_REPOSITORY } from './domain/ports/customer-registration.repository.js';
import { PrismaCustomerRegistrationRepository } from './infrastructure/persistence/prisma-customer-registration.repository.js';
import { AuthController } from './presentation/controllers/auth.controller.js';

@Module({
  imports: [UserModule, CustomerModule, EmployeeModule],
  controllers: [AuthController],
  providers: [
    AuthClaimsResolver,
    RegisterCustomerUseCase,
    LoginUseCase,
    GetMeUseCase,
    {
      provide: CUSTOMER_REGISTRATION_REPOSITORY,
      useClass: PrismaCustomerRegistrationRepository,
    },
  ],
})
export class AuthModule {}
