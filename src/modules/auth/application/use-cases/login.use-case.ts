import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UseCase } from '../../../../shared/application/use-case.interface.js';
import {
  type AuthTokenPayload,
  TOKEN_SERVICE,
  type TokenService,
} from '../../../../shared/infrastructure/jwt/token-service.port.js';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../../user/domain/ports/password-hasher.port.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../user/domain/repositories/user.repository.js';
import { AuthClaimsResolver } from '../services/auth-claims.resolver.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  user: AuthTokenPayload;
}

// TODO: throws padronizados — trocar UnauthorizedException por AuthError (DomainError).
// TODO: rate limiting nesta rota (@nestjs/throttler) contra força bruta.
@Injectable()
export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  // Hash descartável pra comparar quando o e-mail não existe (ver execute).
  private dummyHash?: Promise<string>;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    private readonly authClaimsResolver: AuthClaimsResolver,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );

    if (!user) {
      // Mesmo custo de um login com e-mail válido: sem isso, a resposta mais rápida
      // denunciaria quais e-mails estão cadastrados (enumeração por timing).
      await this.passwordHasher.compare(
        input.password,
        await this.getDummyHash(),
      );
      throw this.invalidCredentials();
    }

    const passwordMatches = await user.verifyPassword(
      input.password,
      this.passwordHasher,
    );
    if (!passwordMatches || !user.isActive) {
      throw this.invalidCredentials();
    }

    const claims = await this.authClaimsResolver.resolve(user);
    if (!claims) {
      throw this.invalidCredentials();
    }

    const accessToken = await this.tokenService.sign(claims);
    return { accessToken, user: claims };
  }

  // Mensagem única pra todos os casos: não revela se foi o e-mail ou a senha.
  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException('Credenciais inválidas.');
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.passwordHasher.hash('dummy-password-for-timing');
    return this.dummyHash;
  }
}
