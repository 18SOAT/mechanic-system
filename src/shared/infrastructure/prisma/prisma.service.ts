import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client.js';

// Conexão lazy: sem $connect no onModuleInit — o Prisma conecta na primeira query.
// Assim a aplicação (e o e2e do CI) sobe sem banco; o erro de conexão aparece na
// primeira query em vez de no boot. Ver docs/code/infra/database.md.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
