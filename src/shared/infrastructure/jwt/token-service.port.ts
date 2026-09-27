import type { EmployeeRole } from '../../../modules/employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../modules/user/domain/enums/user-type.enum.js';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

// Só identificadores internos. O JWT é assinado, NÃO criptografado — qualquer um
// decodifica o payload. Nunca coloque aqui CPF/CNPJ, telefone ou hash.
interface BaseClaims {
  sub: string; // id do User
  email: string;
}

export interface CustomerClaims extends BaseClaims {
  type: UserType.CUSTOMER;
  customerId: string;
}

export interface EmployeeClaims extends BaseClaims {
  type: UserType.EMPLOYEE;
  employeeId: string;
  role: EmployeeRole;
}

// Union discriminada por `type`: um CUSTOMER sem customerId não compila, e depois de
// `if (payload.type === UserType.EMPLOYEE)` o TS já sabe que `payload.role` existe.
export type AuthTokenPayload = CustomerClaims | EmployeeClaims;

export interface TokenService {
  sign(payload: AuthTokenPayload): Promise<string>;
  // Lança se o token for inválido ou expirado.
  verify(token: string): Promise<AuthTokenPayload>;
}

// Whitelist dos claims: copia só os campos do contrato, descartando qualquer extra
// (iat/exp do JWT na leitura, ou campos a mais por engano na escrita).
export function pickAuthClaims(raw: AuthTokenPayload): AuthTokenPayload {
  const base = { sub: raw.sub, email: raw.email };
  return raw.type === UserType.CUSTOMER
    ? { ...base, type: raw.type, customerId: raw.customerId }
    : { ...base, type: raw.type, employeeId: raw.employeeId, role: raw.role };
}
