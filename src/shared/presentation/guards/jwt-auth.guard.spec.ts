import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FakeTokenService } from '../../../../test/fakes/fake-token-service.js';
import { UserType } from '../../../modules/user/domain/enums/user-type.enum.js';
import type { AuthTokenPayload } from '../../infrastructure/jwt/token-service.port.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

function contextWith(
  request: Record<string, any>,
  isPublic = false,
): ExecutionContext {
  const handler = () => undefined;
  if (isPublic) {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
  }
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const tokens = new FakeTokenService();
  const guard = new JwtAuthGuard(new Reflector(), tokens);

  it('libera rota @Public() sem token', async () => {
    await expect(
      guard.canActivate(contextWith({ headers: {} }, true)),
    ).resolves.toBe(true);
  });

  it('nega por padrão quando não há token', async () => {
    await expect(
      guard.canActivate(contextWith({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('nega token inválido ou com esquema diferente de Bearer', async () => {
    await expect(
      guard.canActivate(
        contextWith({ headers: { authorization: 'Bearer lixo' } }),
      ),
    ).rejects.toThrow('Token de acesso inválido ou expirado.');
    await expect(
      guard.canActivate(
        contextWith({
          headers: { authorization: 'Basic qualquer-coisa' },
        }),
      ),
    ).rejects.toThrow('Token de acesso ausente.');
  });

  it('aceita token válido e coloca os claims em request.user', async () => {
    const claims: AuthTokenPayload = {
      sub: 'user-1',
      email: 'joao@oficina.com',
      type: UserType.CUSTOMER,
      customerId: 'customer-1',
    };
    const request: Record<string, any> = {
      headers: { authorization: `Bearer ${await tokens.sign(claims)}` },
    };

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(request.user).toStrictEqual(claims);
  });
});
