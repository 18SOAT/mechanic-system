import type {
  AuthTokenPayload,
  TokenService,
} from '../../src/shared/infrastructure/jwt/token-service.port.js';

// "Token" = payload em JSON base64, sem assinatura: o teste vê exatamente o que foi assinado.
export class FakeTokenService implements TokenService {
  async sign(payload: AuthTokenPayload): Promise<string> {
    return `fake.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  }

  async verify(token: string): Promise<AuthTokenPayload> {
    const [prefix, body] = token.split('.');
    if (prefix !== 'fake' || !body) {
      throw new Error('invalid token');
    }
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  }
}
