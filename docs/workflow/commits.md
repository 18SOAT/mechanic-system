# Convenção de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/), usando o mesmo vocabulário de tipos já usado na [nomenclatura de branch](branching.md): `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`.

## Formato

```
<tipo>: <descrição>
```

Opcionalmente com escopo: `<tipo>(<escopo>): <descrição>`.

A descrição fica em português (idioma do time); o `<tipo>` fica em inglês, pra bater com a nomenclatura de branch e com a ferramentagem (Changesets, CI).

Exemplos:
- `feat: cadastro de cliente com validação de CPF/CNPJ`
- `fix: corrige cálculo de orçamento com peça duplicada`
- `docs: documenta padrão de repository e mapper`

## Commit não substitui Changeset

O commit descreve a mudança no histórico do git. O changeset (ver [changesets.md](changesets.md)) descreve a mudança pro CHANGELOG e pro versionamento — são coisas diferentes, uma não dispensa a outra. Toda mudança relevante em PR ainda precisa do `pnpm changeset`.
