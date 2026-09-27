import type { AuthTokenPayload } from '../../../../shared/infrastructure/jwt/token-service.port.js';
import type { EmployeeRole } from '../../../employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';

// Mesmos dados que vão no JWT, com `sub` exposto como `id`. Whitelist explícita.
// TODO: swagger — @ApiProperty (customerId só pra CUSTOMER; employeeId/role só pra EMPLOYEE).
export class AuthenticatedUserResponseDto {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly type: UserType,
    readonly customerId?: string,
    readonly employeeId?: string,
    readonly role?: EmployeeRole,
  ) {}

  static fromClaims(claims: AuthTokenPayload): AuthenticatedUserResponseDto {
    return claims.type === UserType.CUSTOMER
      ? new AuthenticatedUserResponseDto(
          claims.sub,
          claims.email,
          claims.type,
          claims.customerId,
        )
      : new AuthenticatedUserResponseDto(
          claims.sub,
          claims.email,
          claims.type,
          undefined,
          claims.employeeId,
          claims.role,
        );
  }
}
