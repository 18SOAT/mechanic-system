import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UseCase } from '../../../../shared/application/use-case.interface.js';
import type { AuthTokenPayload } from '../../../../shared/infrastructure/jwt/token-service.port.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../user/domain/repositories/user.repository.js';
import { AuthClaimsResolver } from '../services/auth-claims.resolver.js';

// Relê do banco em vez de só ecoar o token: reflete desativação ou troca de role
// feitas depois da emissão (o token só "atualiza" quando expira).
// TODO: throws padronizados — trocar UnauthorizedException por AuthError (DomainError).
@Injectable()
export class GetMeUseCase implements UseCase<string, AuthTokenPayload> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly authClaimsResolver: AuthClaimsResolver,
  ) {}

  async execute(userId: string): Promise<AuthTokenPayload> {
    const user = await this.userRepository.findById(userId);
    const claims = user?.isActive
      ? await this.authClaimsResolver.resolve(user)
      : null;
    if (!claims) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    }
    return claims;
  }
}
