import type { LoginOutput } from '../../application/use-cases/login.use-case.js';
import { AuthenticatedUserResponseDto } from './authenticated-user.response.dto.js';

// TODO: swagger — @ApiProperty.
export class LoginResponseDto {
  private constructor(
    readonly accessToken: string,
    readonly user: AuthenticatedUserResponseDto,
  ) {}

  static fromOutput(output: LoginOutput): LoginResponseDto {
    return new LoginResponseDto(
      output.accessToken,
      AuthenticatedUserResponseDto.fromClaims(output.user),
    );
  }
}
