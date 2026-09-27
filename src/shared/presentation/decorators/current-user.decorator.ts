import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayload } from '../../infrastructure/jwt/token-service.port.js';

// Payload do JWT colocado em `request.user` pelo JwtAuthGuard.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthTokenPayload =>
    context.switchToHttp().getRequest().user,
);
