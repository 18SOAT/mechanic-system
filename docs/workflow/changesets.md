# Changesets

1. Toda mudança relevante em um PR deve incluir `pnpm changeset` (gera um `.md` em `.changeset/` descrevendo o bump e o resumo). O CI (`changeset-check` em `ci.yml`) falha o PR se faltar.
2. Mudança que não deve gerar release (ex: só doc) pode usar `pnpm exec changeset add --empty`.
3. Ao mergear na `main`, o workflow `release.yml` roda a action `changesets/action`: se houver changesets pendentes, ela abre/atualiza sozinha um PR "Version Packages" com o bump de versão + `CHANGELOG.md` prontos. Ninguém escreve a versão na mão — só revisa e mergeia esse PR.
4. `changelog` está configurado como o gerador padrão (`@changesets/cli/changelog`, sem links do GitHub). Para ter changelog com links de PR/commit/autor, instalar `@changesets/changelog-github` e trocar o campo `"changelog"` do `.changeset/config.json` para `["@changesets/changelog-github", { "repo": "18SOAT/oficina-api" }]`.
5. `baseBranch` no `.changeset/config.json` é `"main"`, que é o branch padrão do repositório (`github.com/18SOAT/oficina-api`).
