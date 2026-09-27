import { Customer } from '../../../customer/domain/entities/customer.entity.js';
import { User } from '../../../user/domain/entities/user.entity.js';

export const CUSTOMER_REGISTRATION_REPOSITORY = Symbol(
  'CUSTOMER_REGISTRATION_REPOSITORY',
);

// Port nomeado pela operação de negócio, não por tabela: o cadastro cria User + Customer
// e precisa ser atômico — ou os dois existem, ou nenhum (sem login órfão).
export interface CustomerRegistrationRepository {
  register(user: User, customer: Customer): Promise<void>;
}
