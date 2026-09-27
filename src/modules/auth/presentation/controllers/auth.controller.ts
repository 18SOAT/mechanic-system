import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { AuthTokenPayload } from '../../../../shared/infrastructure/jwt/token-service.port.js';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RegisterCustomerUseCase } from '../../application/use-cases/register-customer.use-case.js';
import { AuthenticatedUserResponseDto } from '../dtos/authenticated-user.response.dto.js';
import { LoginRequestDto } from '../dtos/login.request.dto.js';
import { LoginResponseDto } from '../dtos/login.response.dto.js';
import { RegisterRequestDto } from '../dtos/register.request.dto.js';
import { UserResponseDto } from '../dtos/user.response.dto.js';

// TODO: swagger — @ApiTags('auth'), @ApiBearerAuth() no /me, @ApiStandardResponse
// e as respostas de erro (400, 401, 409) de cada rota.
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerCustomer: RegisterCustomerUseCase,
    private readonly login: LoginUseCase,
    private readonly getMe: GetMeUseCase,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterRequestDto): Promise<UserResponseDto> {
    const user = await this.registerCustomer.execute(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return LoginResponseDto.fromOutput(await this.login.execute(dto));
  }

  @Get('me')
  async me(
    @CurrentUser() payload: AuthTokenPayload,
  ): Promise<AuthenticatedUserResponseDto> {
    return AuthenticatedUserResponseDto.fromClaims(
      await this.getMe.execute(payload.sub),
    );
  }
}
