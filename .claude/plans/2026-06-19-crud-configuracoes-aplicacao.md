# CRUD de Configurações da Aplicação

## Objective

Criar um bounded context `settings` que gerencia configurações da aplicação como uma tabela chave-valor tipada (`app_settings`), identificada por `id` (UUID auto-gerado) e por `key` (string única), suportando múltiplos tipos de dados (string, number, boolean e objeto JSON). Expor CRUD completo via HTTP seguindo a Clean Architecture do projeto.

## Personas

- **Arquiteto** — análise de domínio, definição da entidade, repositório e plano de tarefas (concluído neste documento)
- **Desenvolvedor** — implementação das tarefas definidas
- **Analista de Segurança** — revisão de segurança e conformidade pós-desenvolvimento

## Decisões de Domínio

**Modelo chave-valor tipado.** A entidade `AppSetting` é o Aggregate Root do novo BC `settings`. Cada configuração possui:

- `id` — UUID auto-gerado (de `BaseEntity`)
- `key` — string única, identificador estável legível (ex.: `"cohost_stay_message_template"`). Normalizada (trim, sem espaços) e validada com regex `^[a-z0-9_.-]+$`.
- `value` — o valor armazenado em coluna `jsonb` (suporta string, number, boolean, objeto JSON).
- `type` — discriminador lógico do tipo do valor: `"string" | "number" | "boolean" | "json"`. Persistido como `varchar` (não usaremos `pgEnum` para manter o padrão do projeto, que valida via Zod na entidade).
- `description` — texto opcional explicando a configuração (max 500).
- timestamps de `BaseEntity` (`created_at`, `updated_at`, `deleted_at`).

**Coerência type/value.** A entidade valida, via um `superRefine` no schema Zod, que `value` é compatível com `type`:

- `string` → `typeof value === "string"`
- `number` → `typeof value === "number"` e finito
- `boolean` → `typeof value === "boolean"`
- `json` → `value` é objeto (não-array, não-null) ou array

Valor inválido para o tipo declarado lança `ValidationError`.

**Unicidade da key.** Coluna `key` com `.unique()` no schema Drizzle. O use case de criação verifica duplicidade e lança `ConflictError`; a atualização não permite alterar a `key` (imutável após criação) para preservar a estabilidade do identificador.

**Soft delete.** `DeleteAppSetting` faz soft delete preenchendo `deleted_at` (consistente com `BaseEntity`). Consultas e listagem filtram `deleted_at IS NULL`.

**Autenticação.** Todas as rotas são `authenticated: true` (configurações são administrativas).

## Mapped Changes

### Camada de Schema (core)

- **`src/core/infra/database/drizzle/schemas/settings_schemas.ts`** _(novo)_ — Define `appSettingsTable` via `pgTable("app_settings", { ...baseSchema, key: varchar({ length: 255 }).notNull().unique(), value: jsonb().notNull(), type: varchar({ length: 20 }).notNull(), description: varchar({ length: 500 }) })`. Sem relations (BC isolado).
- **`src/core/infra/database/drizzle/schema.ts`** _(modificar)_ — Adicionar `export * from "./schemas/settings_schemas";` para registrar a tabela no client Drizzle (`db`).

### Camada de Domínio (`src/settings/domain`)

- **`src/settings/domain/entity/app_setting.ts`** _(novo)_ — Entidade `AppSetting`:
  - `appSettingValueSchema` e `appSettingTypeSchema` (`z.enum(["string","number","boolean","json"])`).
  - `appSettingSchema = baseEntitySchema.extend({ key: z.string().min(1).max(255).regex(...), value: z.unknown(), type: appSettingTypeSchema, description: z.string().max(500).nullable() }).superRefine(...)` validando coerência type/value.
  - `type AppSettingData = z.infer<...>`.
  - Construtor privado `#data` com `appSettingSchema.parse(data)`.
  - `static reconstitute(data)` — carregar do banco.
  - `static create(data: WithoutBaseEntity<AppSettingData>)` — novo objeto; normaliza `key`; gera `#baseEntityData()` (id UUID + timestamps) como em `LedgerEntry`.
  - Método de instância `update(patch: { value?; type?; description? })` que retorna nova `AppSetting` (ou muta `#data` revalidando) atualizando `updated_at`; **não** permite alterar `key`.
  - Getters read-only: `id`, `key`, `value`, `type`, `description`, `created_at`, `updated_at`, `deleted_at`.
  - `softDelete()` que retorna/marca com `deleted_at = new Date()`.
- **`src/settings/domain/repository/app_setting_repository.ts`** _(novo)_ — Interface `AppSettingRepository`:
  - `save(setting: AppSetting): Promise<void>` — insert.
  - `update(setting: AppSetting): Promise<void>` — update por id.
  - `findById(id: string): Promise<AppSetting | null>`
  - `findByKey(key: string): Promise<AppSetting | null>`
  - `list(pagination: PaginationInput): Promise<PaginatedResult<AppSetting>>`
  - `delete(setting: AppSetting): Promise<void>` — persiste o soft delete (`deleted_at`).

### Camada de Aplicação (`src/settings/application`)

DTO de saída comum (definido inline em cada use case, seguindo o padrão do projeto que não tem arquivos de DTO dedicados):
`{ id, key, value, type, description, created_at, updated_at }`.

- **`src/settings/application/use_case/create_app_setting.ts`** _(novo)_ — `CreateAppSettingUseCase`. Input `{ key, value, type, description }`. Verifica `findByKey`; se existir, lança `ConflictError("App setting key already exists")`. Cria `AppSetting.create(...)`, `save`, retorna DTO.
- **`src/settings/application/use_case/get_app_setting.ts`** _(novo)_ — `GetAppSettingUseCase`. Input `{ id?: string; key?: string }` (exatamente um). Resolve via `findById` ou `findByKey`. `ResourceNotFoundError("App setting")` se não encontrado. Retorna DTO.
- **`src/settings/application/use_case/list_app_settings.ts`** _(novo)_ — `ListAppSettingsUseCase`. Input `{ pagination: PaginationInput }`. Retorna `PaginatedResult<DTO>`.
- **`src/settings/application/use_case/update_app_setting.ts`** _(novo)_ — `UpdateAppSettingUseCase`. Input `{ id, value?, type?, description? }`. Carrega via `findById` (`ResourceNotFoundError` se ausente), aplica `update(...)`, persiste via `repository.update`, retorna DTO. `key` não é alterável.
- **`src/settings/application/use_case/delete_app_setting.ts`** _(novo)_ — `DeleteAppSettingUseCase`. Input `{ id }`. Carrega via `findById` (`ResourceNotFoundError`), aplica soft delete, persiste via `repository.delete`. Output `void`.

### Camada de Infra (`src/settings/infra`)

- **`src/settings/infra/database/postgres_repository/app_setting_postgres_repository.ts`** _(novo)_ — `AppSettingPostgresRepository implements AppSettingRepository`. Usa `db` + `appSettingsTable`. `findById`/`findByKey` filtram `isNull(deleted_at)`. `list` segue o padrão de paginação de `LedgerEntryPostgresRepository` (count + select com `limit`/`offset`, `orderBy desc created_at`, `isNull(deleted_at)`), usando `calculatePaginationMetadata`. `update` faz `db.update(...).set({...}).where(eq(id))`. `delete` faz `db.update(...).set({ deleted_at })`. Mapeia rows via `AppSetting.reconstitute`.
- **`src/settings/infra/di/settings_di.ts`** _(novo)_ — Classe `SettingsDi`. Campo privado `#appSettingRepository = new AppSettingPostgresRepository()`. Factory methods: `makeCreateAppSettingUseCase`, `makeGetAppSettingUseCase`, `makeListAppSettingsUseCase`, `makeUpdateAppSettingUseCase`, `makeDeleteAppSettingUseCase`, e os respectivos `make*Controller`.

### Camada de Apresentação (`src/settings/presentation`)

Cada controller implementa `Controller` com `inputSchema` Zod + `openApiSpec` (tags `["Settings"]`), seguindo o padrão de `record_expense.controller.ts` e `find_property_financial_movements.controller.ts`.

- **`src/settings/presentation/controller/create_app_setting.controller.ts`** _(novo)_ — `path = "/settings"`, `POST`. Body: `key`, `value` (`z.unknown()`), `type`, `description?`. Respostas 201/200, 401, 409, 422.
- **`src/settings/presentation/controller/get_app_setting.controller.ts`** _(novo)_ — `path = "/settings/:id"`, `GET`. Suporta busca por id. (Busca por key fica em controller separado abaixo para evitar ambiguidade de rota.)
- **`src/settings/presentation/controller/get_app_setting_by_key.controller.ts`** _(novo)_ — `path = "/settings/key/:key"`, `GET`. Busca por key.
- **`src/settings/presentation/controller/list_app_settings.controller.ts`** _(novo)_ — `path = "/settings"`, `GET`. Query `page`, `limit`. Output paginado.
- **`src/settings/presentation/controller/update_app_setting.controller.ts`** _(novo)_ — `path = "/settings/:id"`, `PUT`. Body: `value?`, `type?`, `description?`. 200, 401, 404, 422.
- **`src/settings/presentation/controller/delete_app_setting.controller.ts`** _(novo)_ — `path = "/settings/:id"`, `DELETE`. 204, 401, 404.

> Nota de roteamento: o `routeMap` em `routes.ts` agrupa handlers por `path` e método HTTP, então `GET /settings` (list) e `POST /settings` (create) coexistem na mesma chave de path; `GET /settings/:id` e `PUT`/`DELETE /settings/:id` idem. A busca por key usa path dedicado `/settings/key/:key` para não colidir com `/settings/:id`.

### Registro de Rotas

- **`src/core/infra/http/routes/routes.ts`** _(modificar)_ — Importar `SettingsDi`, instanciar `const settingsDi = new SettingsDi();`, declarar `const settingsControllers: Route[]` com os 6 controllers (todos `authenticated: true`), e fazer spread em `const controllers = [...]`.

### Banco de Dados

- Após criar o schema, rodar `bun run db:push` (dev) e `bun run db:push:test` (test) para materializar a tabela `app_settings`. Gerar migration com `bun run db:migration` se o fluxo do projeto exigir arquivos de migration versionados.

### Testes

- **`tests/settings/app_setting_crud.test.ts`** _(novo, recomendado)_ — Testes e2e/integração cobrindo create (incl. conflito de key), get by id, get by key, list paginado, update (incl. coerência type/value) e delete (soft delete). Seguir a infra de testes existente em `tests/`.

## Tasks

1. **Schema Drizzle `app_settings`** — Criar `settings_schemas.ts` e registrar no `schema.ts`.
   - Dependencies: none
2. **Entidade `AppSetting`** — Criar entidade com schema Zod, validação type/value, `create`/`reconstitute`/`update`/`softDelete` e getters.
   - Dependencies: task 1
3. **Interface `AppSettingRepository`** — Definir métodos `save`, `update`, `findById`, `findByKey`, `list`, `delete`.
   - Dependencies: task 2
4. **Repositório Postgres** — Implementar `AppSettingPostgresRepository` com paginação e soft delete.
   - Dependencies: tasks 1, 3
5. **Use case CreateAppSetting** — Conflito de key + criação.
   - Dependencies: task 3
6. **Use case GetAppSetting (by id ou key)** — Resolução por id/key + not found.
   - Dependencies: task 3
7. **Use case ListAppSettings** — Listagem paginada.
   - Dependencies: task 3
8. **Use case UpdateAppSetting** — Atualização parcial (sem alterar key).
   - Dependencies: task 3
9. **Use case DeleteAppSetting** — Soft delete + not found.
   - Dependencies: task 3
10. **Controller CreateAppSetting** — POST `/settings` com Zod + OpenAPI.
    - Dependencies: task 5
11. **Controllers GetAppSetting + GetAppSettingByKey** — GET `/settings/:id` e GET `/settings/key/:key`.
    - Dependencies: task 6
12. **Controller ListAppSettings** — GET `/settings` paginado.
    - Dependencies: task 7
13. **Controller UpdateAppSetting** — PUT `/settings/:id`.
    - Dependencies: task 8
14. **Controller DeleteAppSetting** — DELETE `/settings/:id`.
    - Dependencies: task 9
15. **Container DI `SettingsDi`** — Factory methods para use cases e controllers.
    - Dependencies: tasks 4, 10, 11, 12, 13, 14
16. **Registro de rotas** — Instanciar `SettingsDi` e registrar os 6 controllers em `routes.ts`.
    - Dependencies: task 15
17. **Migração de banco** — `db:push` (dev) + `db:push:test` e/ou `db:migration`.
    - Dependencies: task 1
18. **Testes de CRUD** — Suite cobrindo todos os fluxos e validações.
    - Dependencies: tasks 16, 17

> Paralelismo: tasks 5–9 (use cases) podem rodar em paralelo após a task 3. Tasks 10–14 (controllers) dependem de seus respectivos use cases e podem rodar em paralelo entre si. Task 4 (repositório) é independente dos use cases e pode rodar em paralelo com 5–9 após as tasks 1 e 3.
