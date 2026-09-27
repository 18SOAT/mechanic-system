import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service.js';
import { TOKEN_SERVICE } from './token-service.port.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          // Falha no boot: subir sem segredo assinaria tokens com `undefined`.
          throw new Error(
            'JWT_SECRET não definido. Configure no .env (ver .env.example).',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: (process.env.JWT_EXPIRES_IN ||
              '1h') as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [{ provide: TOKEN_SERVICE, useClass: JwtTokenService }],
  exports: [TOKEN_SERVICE],
})
export class JwtTokenModule {}
