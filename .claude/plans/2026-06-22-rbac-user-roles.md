# RBAC — Roles de Usuário (admin / user)

## Objective

Adicionar suporte a roles de usuário (`admin` e `user`) ao BC `auth`, propagando o papel no JWT e aplicando guarda de autorização nas rotas que exigem privilégio de administrador. Concretamente, somente `admin` poderá criar, atualizar e deletar `AppSetting` (POST/PUT/DELETE em `/settings`), enquanto qualquer usuário autenticado continua podendo ler (GET).

## Personas

- **Arquiteto** — análise de domínio, impacto no BC `auth` e nas rotas protegidas, plano de tarefas
- **Desenvolvedor** — implementação das tarefas definidas
- **Analista de Segurança** — revisão pós-desenvolvimento (verificação de bypass de autorização, vazamento de privilégio via input, retrocompatibilidade de token)

## Decisões de Domínio

### 1. Schema da tabela `users`

Adicionar coluna `role` como `varchar({ length: 20 })` com `.notNull().default("user")` em `auth_schemas.ts`. O projeto **não usa `pgEnum`** em nenhum schema (verificado: `app_settings.type` é `varchar` validado por Zod via `z.enum`, `properties` segue o mesmo padrão). Para manter coerência, `role` é `varchar` e a restrição de valores (`"user" | "admin"`) é aplicada na entidade via Zod, não no banco.

**Migration vs `db:push`**: o projeto possui `db:push` e `db:migration`. Como a coluna tem `default("user")`, linhas existentes recebem o valor automaticamente, sem necessidade de backfill manual. Recomenda-se gerar migration (`bun run db:migration`) para registrar a mudança de schema de forma versionada, e `db:push:test` antes de rodar os testes. Decisão: **gerar migration** (consistente com o histórico do projeto) e aplicar `db:push:test` no ambiente de teste.

### 2. Entidade `User`

Adicionar ao `userSchema` (Zod) o campo:

```ts
role: z.enum(["user", "admin"]).default("user"),
```

- `create()` aceita `role` opcional via `WithoutBaseEntity<UserData>`; quando ausente, o `.default("user")` do Zod o preenche. Para garantir que o registro público nunca eleve privilégio, o `RegisterUserUseCase` **não** repassará `role` do input (ver decisão 6).
- `reconstitute()` carrega `role` do banco; como a coluna é `notNull`, sempre virá preenchida. Adicionar getter `get role()`.

### 3. JWT payload

`SessionManager` passa a assinar `{ userId, role }`. Mudanças na interface `ISessionManager`:

```ts
createSession(userId: string, role: UserRole): Promise<string>;
verifySession(token: string): Promise<{ userId: string; role: UserRole }>;
```

- `#sign` recebe `role` e o inclui no payload.
- `#verify` extrai `role`; se ausente (token antigo — ver decisão 7), assume `"user"`.

**Impacto nos chamadores de `createSession`**: `RegisterUserUseCase` e `SignInUseCase` passam a enviar `user.role`.
**Impacto nos chamadores de `verifySession`**: apenas `AuthMiddleware`. Como o middleware já carrega o `User` completo do banco via `findUserById`, o `role` autoritativo vem da entidade carregada — o `role` do token é redundante para autorização e serve apenas como conveniência. **Decisão**: a autorização (decisão 4) usa `user.role` da entidade carregada (fonte da verdade), não o claim do token. Isso elimina o risco de um token com role desatualizada conceder privilégio indevido.

### 4. Mecanismo de autorização — **Opção (a): campo `adminOnly` na `Route` + checagem no adaptador**

Escolhida a opção (a) com a fonte da verdade sendo a entidade `User` (não o claim JWT).

Justificativa:

- O adaptador HTTP (`BunHttpControllerAdapter`) já centraliza a lógica transversal: parsing, validação Zod, autenticação (`if (authenticated)`), serialização e mapeamento de erros. Autorização é a continuação natural desse fluxo e fica num único ponto auditável.
- A `Route` já é o local declarativo onde `authenticated: boolean` é definido por rota. Adicionar `adminOnly?: boolean` é simétrico e mantém a configuração de segurança visível em `routes.ts`, sem espalhar checagens por controllers.
- Opção (b) viola DRY e SRP: cada controller repetiria a checagem; fácil esquecer numa rota nova. Opção (c) (middleware separado) é viável, mas o projeto só tem `AuthMiddleware` e a autenticação já é resolvida inline no adaptador — um segundo middleware encadeado adicionaria indireção sem ganho, já que o `User` já está em mãos no adaptador.

Implementação:

- `adminOnly` implica `authenticated` (uma rota só-admin é necessariamente autenticada). O adaptador, após carregar `user`, se `adminOnly && user.role !== "admin"`, lança `ForbiddenError` → 403.
- Criar `ForbiddenError` em `src/core/application/error/forbidden_error.ts` (segue o padrão de `UnauthorizedError`) e registrá-lo no `errorCodeMap` do adaptador com status **403**.
- Assinatura: `BunHttpControllerAdapter(controller, authenticated, adminOnly)`.

### 5. Rotas de settings a proteger

Marcar `adminOnly: true` (e `authenticated: true`) em `routes.ts` para:

- POST `/settings` — `makeCreateAppSettingController`
- PUT `/settings/:id` — `makeUpdateAppSettingController`
- DELETE `/settings/:id` — `makeDeleteAppSettingController`

Permanecem `authenticated: true, adminOnly: false` (ou omitido):

- GET `/settings` — `makeListAppSettingsController`
- GET `/settings/:id` — `makeGetAppSettingController`
- GET `/settings/key/:key` — `makeGetAppSettingByKeyController`

Atualizar o `openApiSpec` dos três controllers protegidos para incluir resposta `"403": errorResponse("Forbidden — admin role required")`.

### 6. Registro de usuário — `role` não definível via API

Os `inputSchema` de `RegisterUserController` (e `SignInController`) **não** incluem `role`. Como a validação Zod do adaptador faz merge de `query+body+params` e os schemas de settings usam `.strict()`, vale alinhar: o `RegisterUserController.inputSchema` permanece sem `role` — qualquer `role` enviado é simplesmente ignorado (não há `.strict()` lá hoje; manter o comportamento atual de ignorar campos extras é suficiente e seguro porque o use case nunca lê `input.role`).

O `RegisterUserUseCase` chama `User.create({ name, email, password: hashedPassword })` **sem** `role`, deixando o default `"user"` do Zod assumir. Resultado: impossível criar admin pela API pública. A promoção a admin é feita fora da API (seed/migration/operação manual no banco) — fora do escopo desta tarefa, mas documentado.

### 7. Compatibilidade com tokens existentes — **retrocompatível**

Tokens emitidos antes da mudança não têm `role` no payload. Decisão: **tratar ausência de `role` como `"user"`**. Justificativa:

- Não invalida sessões ativas (boa UX, sem logout em massa).
- Seguro por padrão: a ausência de role concede o menor privilégio (`user`), nunca `admin`.
- Reforçado pela decisão 3/4: a autorização real usa `user.role` da entidade carregada do banco, então mesmo um token antigo sem claim resulta em autorização correta baseada no estado atual do usuário. O fallback `"user"` no `#verify` é apenas defensivo para o tipo de retorno.

## Mapped Changes

### Domínio (auth)

- **`src/auth/domain/entity/user.ts`** — adicionar `role: z.enum(["user", "admin"]).default("user")` ao `userSchema`; adicionar getter `get role()`. Exportar tipo `UserRole = z.infer` do enum (ou `"user" | "admin"`) para reuso no `SessionManager`.

### Banco de dados

- **`src/core/infra/database/drizzle/schemas/auth_schemas.ts`** — adicionar coluna `role: varchar({ length: 20 }).notNull().default("user")` em `usersTable`.
- **Migration gerada** em `src/core/infra/database/drizzle/migrations/` (ou diretório equivalente) via `bun run db:migration` — adiciona a coluna `role`.

### Aplicação (auth)

- **`src/auth/application/service/session_manager.ts`** — `ISessionManager.createSession(userId, role)` e `verifySession` retornando `{ userId, role }`; `#sign` inclui `role` no payload; `#verify` extrai `role` com fallback `"user"`.
- **`src/auth/application/use_case/register_user.ts`** — passar `savedUser.role` em `createSession`; **não** repassar `role` do input para `User.create`. Opcional: incluir `role` no `Output.user` (ver controllers).
- **`src/auth/application/use_case/sign_in.ts`** — passar `user.role` em `createSession`. Opcional: incluir `role` no `Output.user`.

### Presentation (auth)

- **`src/auth/presentation/middleware/auth.middleware.ts`** — nenhuma mudança funcional obrigatória (já retorna o `User` completo, que agora tem `role`). `verifySession` muda de assinatura mas o destructuring `{ userId }` continua válido.
- **`src/auth/presentation/controller/auth/sign_in.controller.ts`** e **`register_user.controller.ts`** — decisão de exposição: **incluir `role` no `outputSchema.user`** (`z.enum(["user","admin"])`) e no use case output, para que o frontend possa renderizar UI condicional. `inputSchema` permanece sem `role`.

### Core (autorização)

- **`src/core/application/error/forbidden_error.ts`** (novo) — classe `ForbiddenError extends Error` com `name = "ForbiddenError"`, no padrão de `UnauthorizedError`.
- **`src/core/infra/http/adapters/http_controller_adapter.ts`** — assinatura `BunHttpControllerAdapter(controller, authenticated, adminOnly)`; após carregar `user`, checar `adminOnly && user.role !== "admin"` → lançar `ForbiddenError`; adicionar `[ForbiddenError.name]: 403` ao `errorCodeMap`.
- **`src/core/infra/http/routes/routes.ts`** — adicionar `adminOnly?: boolean` ao type `Route`; marcar `adminOnly: true` nas três rotas de mutação de settings; passar `adminOnly` ao adaptador nas duas chamadas a `BunHttpControllerAdapter`.

### Presentation (settings)

- **`src/settings/presentation/controller/create_app_setting.controller.ts`**, **`update_app_setting.controller.ts`**, **`delete_app_setting.controller.ts`** — adicionar `"403": errorResponse("Forbidden — admin role required")` em `responses` do `openApiSpec`.

### Testes

- **`tests/auth/*`** — atualizar/criar testes: registro define `role: "user"`; token contém `role`; sign-in/register expõem `role` no output.
- **`tests/settings/*`** (e2e existentes) — adicionar casos: usuário `user` recebe 403 em POST/PUT/DELETE `/settings`; usuário `admin` tem sucesso; GETs continuam acessíveis a `user`. Helper de criação de usuário admin (insert direto no banco com `role: "admin"`, já que a API não permite).

## Tasks

1. **Schema do banco + migration** — adicionar coluna `role` em `auth_schemas.ts`; rodar `bun run db:migration` e `bun run db:push:test`.
   - Dependencies: none
2. **Entidade `User`** — adicionar `role` ao `userSchema` (enum com default `"user"`), getter `get role()`, exportar `UserRole`.
   - Dependencies: none
3. **`ForbiddenError`** — criar `src/core/application/error/forbidden_error.ts`.
   - Dependencies: none
4. **`SessionManager`** — incluir `role` no payload e no retorno de `verifySession` (fallback `"user"`); atualizar `ISessionManager`.
   - Dependencies: task 2
5. **Use cases `register_user` e `sign_in`** — passar `role` em `createSession`; não repassar `role` do input no register; incluir `role` no output.
   - Dependencies: tasks 2, 4
6. **Controllers de auth (sign_in, register_user)** — expor `role` no `outputSchema.user`.
   - Dependencies: task 5
7. **Autorização no adaptador HTTP** — assinatura `(controller, authenticated, adminOnly)`; checagem `adminOnly && user.role !== "admin"` → `ForbiddenError`; registrar 403 no `errorCodeMap`.
   - Dependencies: tasks 2, 3
8. **`routes.ts`** — adicionar `adminOnly` ao type `Route`; marcar as 3 rotas de mutação de settings; propagar `adminOnly` ao adaptador.
   - Dependencies: task 7
9. **OpenAPI dos controllers de settings protegidos** — adicionar resposta 403 nos specs de create/update/delete.
   - Dependencies: none
10. **Testes** — auth (role no token/output) e settings (403 para user, sucesso para admin, GET livre); helper de admin via insert direto.
    - Dependencies: tasks 5, 6, 8

> Paralelismo: tasks 1, 2, 3 e 9 não têm dependências e podem rodar em paralelo. Após task 2: tasks 4 → 5 → 6 formam uma cadeia; tasks 3+2 → 7 → 8 formam outra cadeia. Task 10 fecha o ciclo dependendo de 5, 6 e 8.
