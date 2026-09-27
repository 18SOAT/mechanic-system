import { User } from '../../../user/domain/entities/user.entity.js';
import { UserType } from '../../../user/domain/enums/user-type.enum.js';

// Whitelist: só o que é seguro expor. `hashedPassword` nunca entra aqui.
// TODO: swagger — @ApiProperty.
export class UserResponseDto {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly type: UserType,
  ) {}

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(user.idValue, user.emailValue, user.typeValue);
  }
}
