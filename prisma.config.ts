import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // process.env (e não env()) porque `prisma generate` roda no postinstall/CI sem banco;
    // env() lançaria erro com a variável ausente. Comandos que conectam (migrate) exigem o .env.
    url: process.env.DATABASE_URL,
  },
});
