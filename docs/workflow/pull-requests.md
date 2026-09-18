# Pull Requests

## Idioma

Comentários de revisão e a descrição do PR são escritos em **português (PT-BR)** — mesmo com o código e a documentação técnica (`docs/code/`) em inglês.

## Checklist antes de abrir o PR

- [ ] Branch segue a convenção ([branching.md](branching.md)).
- [ ] `pnpm changeset` incluído, descrevendo a mudança — ou `pnpm exec changeset add --empty` se for uma mudança que não deve gerar release (ex: só doc). Ver [changesets.md](changesets.md).
- [ ] `pnpm ci` passa localmente (lint + format, mesma checagem do CI).
- [ ] Testes relevantes cobrindo a mudança (ver `mechanic-system/CLAUDE.md`, seção "Testes").
