# Nomenclatura de branch

Toda branch (exceto `main`/`master`, que são bloqueadas de commit direto) deve seguir `<tipo>/<descricao>`.

**Tipos aceitos:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`.

**Descrição:** letras minúsculas, números, `.`, `_` ou `-` (regex: `[a-z0-9._-]+`).

Exemplos: `feat/cadastro-cliente`, `fix/calculo-orcamento`, `perf/consulta-listagem-os`.

## Validação

Aplicado automaticamente pelo `.husky/pre-commit`, via este regex:

```
^(feat|fix|docs|chore|refactor|test|ci|build|perf|style)/[a-z0-9._-]+$
```

Commit direto em `main`/`master` é bloqueado pelo mesmo hook.
