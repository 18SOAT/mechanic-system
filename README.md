<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">Back-end do <strong>Tech Challenge FIAP</strong>: sistema de atendimento e execução de serviços de uma oficina mecânica, construído com <a href="http://nestjs.com/" target="_blank">NestJS</a>.</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

## Descrição

MVP de back-end para o **Tech Challenge FIAP**: uma oficina mecânica de médio porte quer sair de planilha/papel para um sistema integrado de atendimento e execução de serviços — ordens de serviço, clientes, veículos e peças/estoque — aplicando DDD e boas práticas de qualidade e segurança.

## Stack

NestJS + TypeScript · PostgreSQL + Prisma ORM · Docker/docker-compose · Swagger · JWT · Vitest · Biome · Husky · Changesets

> Prisma, PostgreSQL, Docker e Swagger ainda serão adicionados — este README será atualizado conforme o projeto avança.

## Instalação

```bash
pnpm install
```

## Compilando e rodando o projeto

```bash
# desenvolvimento
pnpm run start

# watch mode
pnpm run start:dev

# produção
pnpm run start:prod
```

## Testes

```bash
# unitários
pnpm run test

# e2e
pnpm run test:e2e

# cobertura
pnpm run test:cov
```

## Qualidade

```bash
pnpm lint    # biome lint
pnpm check   # biome lint + format --write
pnpm ci      # checagem usada no CI (não escreve nada)
```

## Recursos

Documentação completa da arquitetura, escopo do domínio e convenções de código em [`CLAUDE.md`](./CLAUDE.md). Para saber mais sobre o framework, veja a [documentação do NestJS](https://docs.nestjs.com).

## Licença

Uso acadêmico (FIAP) — sem licença pública.
