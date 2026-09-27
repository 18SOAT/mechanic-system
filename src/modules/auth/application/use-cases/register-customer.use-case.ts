import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UseCase } from '../../../../shared/application/use-case.interface.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Customer } from '../../../customer/domain/entities/customer.entity.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../../customer/domain/repositories/customer.repository.js';
import { Document } from '../../../customer/domain/value-objects/document.vo.js';
import { Phone } from '../../../customer/domain/value-objects/phone.vo.js';
import { User } from '../../../user/domain/entities/user.entity.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../../user/domain/ports/password-hasher.port.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../user/domain/repositories/user.repository.js';
import { Password } from '../../../user/domain/value-objects/password.vo.js';
import {
  CUSTOMER_REGISTRATION_REPOSITORY,
  type CustomerRegistrationRepository,
} from '../../domain/ports/customer-registration.repository.js';

export interface RegisterCustomerInput {
  email: string;
  password: string;
  document: string;
  phone: string;
}

// TODO: throws padronizados — trocar as HttpExceptions do Nest por AuthError/CustomerError
// (DomainError) + DomainExceptionFilter. Use case não deveria conhecer HTTP.
@Injectable()
export class RegisterCustomerUseCase
  implements UseCase<RegisterCustomerInput, User>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(CUSTOMER_REGISTRATION_REPOSITORY)
    private readonly registrationRepository: CustomerRegistrationRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterCustomerInput): Promise<User> {
    const { email, password, document, phone } = this.buildValueObjects(input);

    if (await this.userRepository.findByEmail(email.value)) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    // TODO: quando existir o CRUD de clientes, um Customer criado no balcão (sem userId)
    // deve ser VINCULADO ao novo login (primeiro acesso), em vez de dar conflito.
    if (await this.customerRepository.findByDocument(document.value)) {
      throw new ConflictException('CPF/CNPJ já cadastrado.');
    }

    const user = User.create({
      email,
      hashedPassword: await this.passwordHasher.hash(password.value),
      type: UserType.CUSTOMER,
    });
    const customer = Customer.create({
      userId: user.idValue,
      document,
      email,
      phone,
    });

    await this.registrationRepository.register(user, customer);
    return user;
  }

  private buildValueObjects(input: RegisterCustomerInput) {
    try {
      return {
        email: Email.create(input.email),
        password: Password.create(input.password),
        document: Document.create(input.document),
        phone: Phone.create(input.phone),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
