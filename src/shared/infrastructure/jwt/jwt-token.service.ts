import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type AuthTokenPayload,
  pickAuthClaims,
  type TokenService,
} from './token-service.port.js';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: AuthTokenPayload): Promise<string> {
    return this.jwtService.signAsync({ ...pickAuthClaims(payload) });
  }

  async verify(token: string): Promise<AuthTokenPayload> {
    const decoded = await this.jwtService.verifyAsync<AuthTokenPayload>(token);
    return pickAuthClaims(decoded);
  }
}
