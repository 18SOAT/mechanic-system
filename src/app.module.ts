import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { JwtTokenModule } from './shared/infrastructure/jwt/jwt-token.module.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';
import { JwtAuthGuard } from './shared/presentation/guards/jwt-auth.guard.js';

@Module({
  imports: [PrismaModule, JwtTokenModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
