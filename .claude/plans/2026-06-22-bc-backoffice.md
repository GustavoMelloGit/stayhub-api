# BC Backoffice — Renomear settings para backoffice

## Objective

Reorganizar o código movendo o BC `settings` para um novo BC `backoffice`, que agrega casos de uso, rotas e controladores restritos a administradores. O BC `backoffice` passa a ser o lar natural de `AppSetting` e de futuras features admin-only.

## Personas

- **Arquiteto** — análise de impacto, mapeamento de arquivos, decisões de nomenclatura e plano de tarefas
- **Desenvolvedor** — implementação das tarefas definidas
- **Analista de Segurança** — revisão pós-desenvolvimento (rotas admin-only, RBAC)

## Decisões de Domínio

As decisões abaixo foram tomadas com base na análise das referências existentes e nas convenções do projeto.

### 1. Caminho do BC: `src/settings/` → `src/backoffice/`

Move-se a árvore inteira. `backoffice` é o bounded context (o agrupador admin); `AppSetting` é o agregado que vive dentro dele. A subestrutura de pastas internas (`domain/`, `application/`, `infra/`, `presentation/`) e os nomes de arquivo `*app_setting*` **permanecem inalterados** — eles descrevem o agregado, não o BC.

### 2. Prefixo de rotas HTTP: **mantém `/settings`** (não vira `/backoffice/settings`)

Argumentos REST:

- O recurso exposto continua sendo o coletivo `settings` (`/settings`, `/settings/:id`, `/settings/key/:key`). A URL nomeia o **recurso**, não o bounded context interno. `backoffice` é uma fronteira de código/domínio, não um recurso HTTP.
- O controle de acesso admin-only já é expresso via `adminOnly: true` em `routes.ts` (RBAC), não pelo path. Prefixar `/backoffice` seria redundante e acoplaria a URL pública à organização interna do código.
- Evita quebrar contratos de clientes e os testes e2e existentes que usam `/settings`.

Consequência: os controllers **não** mudam o campo `path`. Os testes e2e **não** mudam as URLs chamadas.

### 3. Nomes de classes

| Atual                                 | Novo           | Justificativa                                     |
| ------------------------------------- | -------------- | ------------------------------------------------- |
| `SettingsDi`                          | `BackofficeDi` | O container DI representa o BC inteiro → renomeia |
| `CreateAppSettingController`          | mantém         | Nomeia o agregado `AppSetting`, não o BC          |
| `*AppSetting*UseCase` / `*Repository` | mantém         | idem — descrevem o agregado                       |
| `AppSetting` (entidade)               | mantém         | O agregado continua sendo `AppSetting`            |

Apenas `SettingsDi` → `BackofficeDi` é renomeado. Variável `settingsDi` em `routes.ts` → `backofficeDi`. Array `settingsControllers` → `backofficeControllers`.

### 4. Schema Drizzle e tabela do banco

- **Arquivo do schema**: `src/core/infra/database/drizzle/schemas/settings_schemas.ts` → `backoffice_schemas.ts`. O re-export em `schema.ts` é atualizado.
- **Nome da tabela `app_settings`**: **PERMANECE** `app_settings`. A tabela nomeia o agregado `AppSetting`, não o BC. Renomear a tabela exigiria migration de `ALTER TABLE ... RENAME`, dados em produção e quebraria a migration `0000` já existente — sem benefício de domínio (o agregado não mudou de nome).
- **Constante `appSettingsTable`**: permanece (descreve o agregado). O import no repositório continua apontando para `core/.../schema` (barrel), que não muda de caminho.
- **Sem nova migration**: nenhuma mudança de DDL. O snapshot `drizzle/meta` e `drizzle/0000_*.sql` permanecem intactos.

### 5. Testes: `tests/settings/` → `tests/backoffice/`

Move-se o diretório. O nome do arquivo `app_setting_crud.test.ts` permanece (descreve o agregado testado). Dentro do teste, a constante `TABLES = ["app_settings", ...]` e as URLs `/settings` **permanecem** (tabela e rotas não mudam — ver decisões 2 e 4). Apenas o caminho do diretório muda.

## Mapped Changes

### Mover diretório do BC (git mv, sem alterar conteúdo dos arquivos exceto onde indicado)

- `src/settings/` → `src/backoffice/` (árvore inteira, 15 arquivos):
  - `src/backoffice/domain/entity/app_setting.ts`
  - `src/backoffice/domain/repository/app_setting_repository.ts`
  - `src/backoffice/application/use_case/{create,delete,get,list,update}_app_setting*.ts`
  - `src/backoffice/infra/database/postgres_repository/app_setting_postgres_repository.ts`
  - `src/backoffice/infra/di/settings_di.ts` → renomear para `backoffice_di.ts` (ver abaixo)
  - `src/backoffice/presentation/controller/*.controller.ts` (6 arquivos)

  Os imports relativos internos (`../../domain/...`) **não mudam** com o move. O único import absoluto que cruza fronteira é o do repositório para `core/.../schema` (barrel), que não muda de caminho.

### Renomear o DI

- `src/backoffice/infra/di/settings_di.ts` → `src/backoffice/infra/di/backoffice_di.ts`
  - Dentro do arquivo: `export class SettingsDi` → `export class BackofficeDi`

### Renomear o schema Drizzle

- `src/core/infra/database/drizzle/schemas/settings_schemas.ts` → `backoffice_schemas.ts`
  - Conteúdo inalterado (tabela continua `app_settings`, constante `appSettingsTable`)
- `src/core/infra/database/drizzle/schema.ts` (linha 6):
  - `export * from "./schemas/settings_schemas";` → `export * from "./schemas/backoffice_schemas";`

### Atualizar o roteamento

- `src/core/infra/http/routes/routes.ts`:
  - linha 14: `import { SettingsDi } from "../../../../settings/infra/di/settings_di";` → `import { BackofficeDi } from "../../../../backoffice/infra/di/backoffice_di";`
  - linha 25: `const settingsDi = new SettingsDi();` → `const backofficeDi = new BackofficeDi();`
  - linhas 140–168: array `settingsControllers` → `backofficeControllers`; todas as referências `settingsDi.make*` → `backofficeDi.make*`
  - linha 177: `...settingsControllers,` → `...backofficeControllers,`

### Mover os testes

- `tests/settings/app_setting_crud.test.ts` → `tests/backoffice/app_setting_crud.test.ts`
  - Conteúdo inalterado (URLs `/settings` e `TABLES = ["app_settings", ...]` permanecem)

### Sem alterações (confirmado por grep)

- Controllers (`path = "/settings..."`) — permanecem
- Tabela `app_settings`, migration `0000`, `drizzle/meta` — permanecem
- Entidade `AppSetting`, use cases, repositório, interface de repositório — nomes permanecem

## Tasks

1. **Mover árvore do BC** — `git mv src/settings src/backoffice`. Verificar que os imports relativos internos seguem resolvendo.
   - Dependencies: none
2. **Renomear DI** — `git mv src/backoffice/infra/di/settings_di.ts src/backoffice/infra/di/backoffice_di.ts` e renomear a classe `SettingsDi` → `BackofficeDi` dentro do arquivo.
   - Dependencies: task 1
3. **Renomear schema Drizzle** — `git mv src/core/infra/database/drizzle/schemas/settings_schemas.ts .../backoffice_schemas.ts` e atualizar o re-export em `schema.ts`.
   - Dependencies: none
4. **Atualizar `routes.ts`** — import do `BackofficeDi`, variável `backofficeDi`, array `backofficeControllers`, referências `make*` e spread em `controllers`.
   - Dependencies: task 2
5. **Mover testes** — `git mv tests/settings tests/backoffice` (conteúdo inalterado).
   - Dependencies: task 1
6. **Verificação** — rodar `bun run lint:check`, `bun run format:check` e `bun run test` (com schema de teste já aplicado) para garantir que nada quebrou. Confirmar com grep que não restam referências a `src/settings`, `tests/settings`, `SettingsDi` ou `settings_schemas`.
   - Dependencies: tasks 2, 3, 4, 5

> Tasks 1 e 3 não têm dependências entre si e podem rodar em paralelo. Task 5 depende apenas de task 1. Tasks 2 e 4 são sequenciais (4 depende de 2). Task 6 é o gate final.
