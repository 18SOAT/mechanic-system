# Pull Requests

## Idioma

Comentários de revisão e a descrição do PR são escritos em **português (PT-BR)**. Toda a documentação em `docs/` também está em português; só o código (nomes de classes, métodos, variáveis) fica em inglês.

## Checklist antes de abrir o PR

- [ ] Branch segue a convenção ([branching.md](branching.md)).
- [ ] `pnpm changeset` incluído, descrevendo a mudança — ou `pnpm exec changeset add --empty` se for uma mudança que não deve gerar release (ex: só doc). Ver [changesets.md](changesets.md).
- [ ] `pnpm ci` passa localmente (lint + format, mesma checagem do CI).
- [ ] Testes relevantes cobrindo a mudança (ver `mechanic-system/CLAUDE.md`, seção "Testes").
