# Contexto do projeto

**Tech Challenge FIAP** — MVP de back-end para uma oficina mecânica de médio porte, que hoje controla tudo por planilha/papel e quer um **Sistema Integrado de Atendimento e Execução de Serviços**: cliente acompanha a OS em tempo real, autoriza reparos extras, e a oficina ganha gestão interna eficiente. Vale 90% da nota da fase.

Stack: **NestJS 12** + TypeScript, gerenciado com **pnpm**, testado com **Vitest**, lint + format com **Biome**. Git hooks com **Husky** (pre-commit roda lint-staged, pre-push roda os testes). CI no **GitHub Actions** (`.github/workflows/ci.yml`). Versionamento com **Changesets** (`.changeset/`, `.github/workflows/release.yml`). Banco de dados **PostgreSQL** via **Prisma ORM**, containerizado com **Docker**/`docker-compose`, API documentada com **Swagger**, autenticação **JWT** nas rotas administrativas. *(Prisma/Postgres/Docker/Swagger ainda não instalados — só definidos pra contexto; entram quando começarmos a implementação.)*

O projeto deve seguir **DDD (Domain-Driven Design)** tático, com **Clean Architecture + Ports & Adapters** (monolito modular, camadas `domain/application/infrastructure/presentation` por módulo), aplicado em cima da arquitetura modular do NestJS.

## Escopo funcional obrigatório

- **Criação de OS**: identificar cliente por CPF/CNPJ, cadastrar veículo (placa, marca, modelo, ano), incluir serviços solicitados e peças/insumos, gerar orçamento automático, enviar pro cliente aprovar.
- **Acompanhamento de OS**: status `Recebida → Em diagnóstico → Aguardando aprovação → Em execução → Finalizada → Entregue`, transição automática conforme ações do sistema, consulta do progresso via API pelo cliente.
- **Gestão administrativa**: CRUD de clientes, veículos, serviços, peças/insumos (com controle de estoque), listagem/detalhe de OS, tempo médio de execução dos serviços.
- **Segurança e qualidade**: JWT nas APIs administrativas, validação de dados sensíveis (CPF/CNPJ, placa), testes unitários e de integração nos fluxos principais, cobertura mínima de 80% nos domínios críticos.

## Entregáveis da fase

Vídeo (≤15min), documentação DDD (Event Storming dos fluxos de OS e de peças/insumos, diagramas, linguagem ubíqua), código-fonte em repositório privado (Dockerfile + docker-compose + README), relatório de análise de vulnerabilidades, e um PDF com grupo/links/relatório.

⚠️ O repositório privado precisa dar acesso ao usuário **soatarchitecture** — não esquecer ao criar o repo no GitHub.

A estrutura de pastas, os padrões de código (Use Case, Repository, tratamento de erro, etc.) e o fluxo de git (branch, commit, PR, changesets) estão documentados em [`docs/code/README.md`](docs/code/README.md) e [`docs/workflow/README.md`](docs/workflow/README.md), respectivamente.

## Você deve ser um professor

Sempre que for implementar algo, **explique o conceito antes de codar**:
- Diga qual conceito de DDD ou do NestJS está envolvido (ex: por que isso é um Value Object e não uma string solta; por que a regra fica na entidade e não no service).
- Explique o motivo da escolha (trade-offs), não só o "como".
- Depois disso, implemente.
- Responda em português.

## Comandos

- `pnpm install` — instalar dependências
- `pnpm start:dev` — subir em modo watch
- `pnpm test` — testes unitários (Vitest)
- `pnpm test:e2e` — testes e2e
- `pnpm test:cov` — cobertura
- `pnpm lint` — biome lint
- `pnpm format` — biome format --write
- `pnpm check` — biome check --write (lint + format, usado pelo lint-staged)
- `pnpm ci` — biome ci (mesma checagem do CI, sem escrever nada — falha se algo estiver fora do padrão)
- `pnpm changeset` — cria um novo arquivo de changeset (descreve a mudança + tipo de bump patch/minor/major)
- `pnpm changeset:status` — mostra se há changeset pendente comparado ao `main` (o que o CI roda em PRs)
- `pnpm version` — aplica os changesets pendentes: bump de versão + atualização do `CHANGELOG.md`

## Testes

- Regras de negócio de domínio (entidades, value objects, use cases) devem ter teste unitário com Vitest, sem subir o Nest — teste a classe isolada.
- Testes de endpoint (controllers) ficam em `test/*.e2e-spec.ts`.

## Cuidado: Biome `useImportType` quebra DI do NestJS

A regra `style/useImportType` do Biome está **desativada** neste projeto (ver `biome.json`). Ela reescreve automaticamente imports usados só como tipo para `import type { X }`. Isso quebra qualquer classe recebida por **injeção de dependência no construtor** (`constructor(private readonly x: X)`), porque o NestJS resolve DI em runtime via metadados de decorators (`emitDecoratorMetadata`) — um `import type` é apagado na compilação e o valor runtime da classe some, e o Nest não consegue mais resolver o provider. Se recriar/alterar o `biome.json`, mantenha essa regra desligada.

## Fluxo de Changesets

Toda mudança relevante em PR precisa de `pnpm changeset` (ou `pnpm exec changeset add --empty` se for só doc). Detalhe completo do fluxo (PR automático de versão, configuração do `baseBranch`, troca de gerador de changelog) em [`docs/workflow/changesets.md`](docs/workflow/changesets.md).

## Convenção de nomes de branch

`<tipo>/<descricao>`, com `<tipo>` em `feat, fix, docs, chore, refactor, test, ci, build, perf, style` — validado no `.husky/pre-commit`. Detalhe completo em [`docs/workflow/branching.md`](docs/workflow/branching.md).

## Convenção de commit e idioma de PR

Commits seguem Conventional Commits com os mesmos tipos da branch; comentário e descrição de PR são em português. Detalhe em [`docs/workflow/commits.md`](docs/workflow/commits.md) e [`docs/workflow/pull-requests.md`](docs/workflow/pull-requests.md).
