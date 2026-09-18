# Changesets

1. Toda mudança relevante em um PR deve incluir `pnpm changeset` (gera um `.md` em `.changeset/` descrevendo o bump e o resumo). O CI (`changeset-check` em `ci.yml`) falha o PR se faltar.
2. Mudança que não deve gerar release (ex: só doc) pode usar `pnpm exec changeset add --empty`.
3. Ao mergear na `main`, o workflow `release.yml` roda a action `changesets/action`: se houver changesets pendentes, ela abre/atualiza sozinha um PR "Version Packages" com o bump de versão + `CHANGELOG.md` prontos. Ninguém escreve a versão na mão — só revisa e mergeia esse PR.
4. `changelog` está configurado como o gerador padrão (`@changesets/cli/changelog`, sem links do GitHub). Para ter changelog com links de PR/commit/autor, instalar `@changesets/changelog-github` e trocar o campo `"changelog"` do `.changeset/config.json` para `["@changesets/changelog-github", { "repo": "18SOAT/oficina-api" }]`.
5. `baseBranch` no `.changeset/config.json` é `"main"`, que é o branch padrão do repositório (`github.com/18SOAT/oficina-api`).

## Categoria do resumo

O resumo escrito no `pnpm changeset` (o texto que vai pro `CHANGELOG.md`) começa com uma das categorias abaixo, em português — isso é independente do `<tipo>` do commit/branch (que fica em inglês, ver [commits.md](commits.md)), porque o changeset é lido por qualquer pessoa consultando o changelog, não só por quem mexe no código:

- **Melhoria:** — funcionalidade nova ou melhoria em algo que já existe.
- **Correção:** — correção de bug.
- **Ajuste:** — mudança pontual sem impacto funcional direto (refatoração, configuração, formatação, etc.).

Exemplos:

```
Melhoria: adiciona validação de CPF/CNPJ no cadastro de cliente
Correção: corrige cálculo de orçamento quando há peça duplicada
Ajuste: renomeia variável de ambiente do banco
```
