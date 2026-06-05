# Infraestrutura de Testes E2E + Primeiro Teste (Sign-In)

## Objective

Habilitar `bun test` no projeto e estabelecer uma infraestrutura de testes end-to-end que exercita a API através de HTTP real (servidor + rotas + banco), entregando como prova de conceito o primeiro teste e2e da rota `POST /auth/sign-in`. A motivação é garantir regressão automatizada sobre o contrato HTTP público (status codes, shape de resposta, autenticação), que hoje não tem nenhuma cobertura.

## Personas

- **Arquiteto** (`.claude/personas/arquiteto.md`) — autor deste plano (decisões e diretrizes).
- **Desenvolvedor** (`.claude/personas/desenvolvedor.md`) — executa as tasks de implementação.

## Decisões Arquiteturais

### a) Como iniciar o servidor nos testes — DECISÃO: (a) `Bun.serve()` no setup global, porta efêmera

Sobe-se **um único** `Bun.serve()` real no preload global (`port: 0` → porta atribuída pelo SO), usando o **mesmo** `bunRoutes` de produção. A base URL resultante é exposta para os testes via um helper. Os testes batem na API com `fetch(baseUrl + path)`.

Justificativa:

- É genuinamente **e2e**: passa pelo `Bun.serve`, pelo `BunHttpControllerAdapter` (parse de body, validação Zod, mapeamento de erro → status, CORS, serialização de datas) e pela rota real registrada. Nenhuma dessas camadas é mockada.
- Mais **isolado** que a opção (b): não depende de um processo externo já rodando, nem da porta fixa de `env.PORT` (evita colisão com o `bun run dev`). `port: 0` elimina flakiness de "porta em uso".
- Mais **fiel** que a opção (c): chamar o handler direto pularia o roteamento do `Bun.serve` e a montagem real de `Request`/`Response`, deixando passar bugs de integração (ex.: header parsing, content-type, status default 200/204).
- **Um servidor por run** (não por teste): o custo de subir o servidor é pago uma vez no preload; os testes compartilham a instância. Servidor é stateless — o estado mutável vive no banco, isolado por outro mecanismo (ver item b).

### b) Banco de dados de teste — DECISÃO: banco dedicado via `DATABASE_URL` de teste + truncate por teste

Restrição descoberta no código: `src/core/infra/database/drizzle/database.ts` cria `db = drizzle(env.DATABASE_URL)` **no import-time**, e `env` é resolvido **no import-time** (`environments.ts` faz `envSchema.parse(process.env)` no top-level). Logo, a conexão não pode ser trocada em runtime — a `DATABASE_URL` correta precisa já estar no `process.env` **antes** do primeiro import de qualquer módulo do `src`.

Estratégia:

- **Banco separado**, ex. `stayhub_test`, apontado por uma `DATABASE_URL` exclusiva carregada do `.env.test` (ver item d). Nunca o banco de dev/prod — os testes truncam tabelas.
- **Schema aplicado antes do run**: o desenvolvedor roda `drizzle-kit push` contra o banco de teste antes de `bun test` (documentado no script). Não automatizamos o push dentro do preload nesta primeira iteração (mantém o preload rápido e previsível); fica como melhoria futura.
- **Isolamento entre testes via truncate**, não transação: o teste e2e faz `fetch` num processo/conexão que é a mesma do servidor, mas a granularidade de transação por request não é viável aqui. A escolha é **limpar as tabelas relevantes** (`TRUNCATE ... RESTART IDENTITY CASCADE`) num `beforeEach`/`afterEach` via helper. Para o teste de sign-in, basta truncar `users` (CASCADE cobre dependências). Isso garante que cada teste parte de um estado conhecido e que runs repetidos sejam idempotentes (resolve "cleanup entre runs").
- **Guard-rail de segurança**: o helper de banco deve recusar-se a truncar se `env.NODE_ENV !== "test"`, prevenindo execução acidental contra dev/prod.

### c) Arquivo de setup global (`--preload`) — DECISÃO: SIM, necessário

`bun test --preload ./tests/setup.ts` executa o arquivo uma vez antes da suíte. Responsabilidades dele:

1. **Subir o servidor** (`Bun.serve` com `port: 0`, `routes: bunRoutes`) e expor a `baseUrl` para os helpers/testes.
2. **Derrubar o servidor** no teardown (`afterAll` global via `server.stop()`), evitando handle vazado entre runs.
3. (Não faz push de schema nem trunca globalmente — isolamento é por-teste, item b.)

Sem o preload, cada arquivo de teste teria de subir/derrubar seu próprio servidor, multiplicando custo e risco de porta. Centralizar no preload é o padrão idiomático do `bun test`.

### d) Variáveis de ambiente — DECISÃO: criar `.env.test`, carregado via flag explícita

`bun test` carrega `.env` automaticamente, mas **não** `.env.test` por convenção própria — o `NODE_ENV` precisa ser `test` e as envs precisam apontar para o banco de teste. Decisão:

- Criar **`.env.test`** (commitado com valores não-secretos para o banco local de teste; NÃO entra no `.gitignore` porque o padrão atual ignora apenas `.env.test.local`). Deve conter **todas** as chaves que `environments.ts` exige, pois o parse é total e falha se faltar qualquer uma:
  - `NODE_ENV=test`
  - `PORT=0` (ignorado pelo preload, que usa `port: 0`, mas precisa passar no schema `z.coerce.number()`)
  - `DATABASE_URL=postgresql://.../stayhub_test`
  - `JWT_SECRET=<valor de teste fixo>`
  - `TUYA_DEVICE_ID`, `TUYA_CLIENT_ID`, `TUYA_CLIENT_SECRET` — valores dummy (`"test"`), pois são exigidos pelo schema mesmo sem uso no fluxo de sign-in.
- O script de teste injeta esse arquivo. Como `bun test` lê `.env` mas não troca de arquivo por NODE_ENV, o script será explícito: `bun test --env-file=.env.test` (ou, alternativamente, exportar `NODE_ENV=test` + `--env-file`). A flag `--env-file` garante que a `DATABASE_URL` de teste esteja no `process.env` antes do import de `database.ts`. **Esta é a peça crítica** que conecta a decisão (b) à inicialização import-time.

## Decisão de Isolamento — REVISADA (schema PostgreSQL separado)

**Decisão:** usar o mesmo banco PostgreSQL com um schema `test` separado, via `search_path` na connection string — em vez de um banco `stayhub_test` separado.

**Por quê:** o código usa `pgTable`/`pgEnum` sem prefixo de schema, então o `search_path` resolve tudo de forma transparente — zero mudança nas definições de tabela. Mais simples de provisionar localmente (só `CREATE SCHEMA test`).

**Risco principal:** `drizzle-kit push` é destrutivo no banco compartilhado. Mitigação: `schemaFilter: [env.DB_SCHEMA]` no `drizzle.config.ts` + script `db:push:test` com guarda de `NODE_ENV`.

## Mapped Changes

- **`src/core/infra/config/environments.ts`** — adicionar `DB_SCHEMA: z.string().trim().default("public")` ao `envSchema`.
- **`drizzle.config.ts`** — adicionar `schemaFilter: [env.DB_SCHEMA]` para o push operar apenas no schema correto.
- **`package.json`** — scripts `"test": "bun test --preload ./tests/setup.ts"` e `"db:push:test": "psql $DATABASE_URL -c 'CREATE SCHEMA IF NOT EXISTS test' && drizzle-kit push"`.
- **`.env.test`** (novo) — `NODE_ENV=test`, `DATABASE_URL` com `?options=-c%20search_path%3Dtest`, `DB_SCHEMA=test`, `PORT=0`, JWT fixo, Tuya dummy. Bun carrega `.env.test` automaticamente quando `NODE_ENV=test`.
- **`tests/setup.ts`** (novo) — preload global: sobe `Bun.serve({ port: 0, routes: bunRoutes })`, exporta `baseUrl`, registra teardown.
- **`tests/helpers/server.ts`** (novo) — expõe a `baseUrl` do servidor de teste e um `api(path, init)` wrapper sobre `fetch`.
- **`tests/helpers/database.ts`** (novo) — `truncate(tables)` com guard `NODE_ENV === "test"`; usa o mesmo `db` singleton.
- **`tests/helpers/fixtures/user.ts`** (novo) — `createUserFixture({ email, password, name })`: persiste usuário com senha hashada via `Bun.password.hash` + entidade de domínio + repositório. Retorna `{ user, plainPassword }`.
- **`tests/auth/sign_in.test.ts`** (novo) — primeiro teste e2e (4 cenários).
- **`CLAUDE.md`** — atualizar "Não há test runner configurado" para documentar `bun run test` e pré-requisito de `bun run db:push:test`.

## Tasks

1. **Configurar env e drizzle para schema de teste** — adicionar `DB_SCHEMA` em `environments.ts`, `schemaFilter` em `drizzle.config.ts`, criar `.env.test`.
   - Dependencies: none
2. **Adicionar scripts no `package.json`** — `test` e `db:push:test`.
   - Dependencies: task 1
3. **Criar helper de servidor + preload** (`tests/setup.ts`, `tests/helpers/server.ts`).
   - Dependencies: none
4. **Criar helper de banco** (`tests/helpers/database.ts`) — `truncate()` com guard de `NODE_ENV === "test"`.
   - Dependencies: none
5. **Criar fixture de usuário** (`tests/helpers/fixtures/user.ts`).
   - Dependencies: tasks 3, 4
6. **Escrever `tests/auth/sign_in.test.ts`** — 4 cenários.
   - Dependencies: tasks 2, 3, 4, 5
7. **Atualizar `CLAUDE.md`**.
   - Dependencies: task 2

> Tasks 1, 3 e 4 podem rodar em paralelo. Task 5 depende de 3 e 4. Task 6 é o ponto de junção.

## Diretrizes para o Desenvolvedor

### Nomenclatura

- Arquivos de teste: `tests/<bounded context>/<nome>.test.ts` (snake_case), ex. `tests/auth/sign_in.test.ts`.
- Helpers: `tests/helpers/<nome>.ts` (snake_case). Fixtures: `tests/helpers/fixtures/<entidade>.ts`.
- Imports do `src` por caminho relativo, consistente com o restante do projeto (sem path aliases — o tsconfig não define `paths`).

### Servidor e requisições

- Use **sempre** o helper `api()` / `baseUrl` do preload; nunca suba `Bun.serve` dentro de um arquivo de teste.
- Importe `bunRoutes` **apenas** no `tests/setup.ts`. Os testes não importam o servidor diretamente — só o helper.

### Fixtures de usuário (criar/limpar)

- **Criar**: a senha precisa ser hashada com `Bun.password.hash` (o sign-in usa `BunHasher.compare`, que é `Bun.password.verify`). Não insira senha em claro — o teste de sucesso falharia. Use a entidade `User.create({ name, email, password: hashedPassword })` + `AuthPostgresRepository.addUser` para passar pelas mesmas invariantes do domínio. O fixture retorna `{ user, plainPassword }`.
- **Limpar**: em `beforeEach` (ou `afterEach`), chame `truncate(["users"])` — `RESTART IDENTITY CASCADE`. Prefira `beforeEach` para garantir estado limpo mesmo após um run interrompido. Nunca confie em ordem de testes para estado.
- O helper de banco deve **abortar** se `env.NODE_ENV !== "test"`.

### Cenários mínimos do teste de sign-in (`tests/auth/sign_in.test.ts`)

1. **200 sucesso** — dado um usuário fixture com email/senha conhecidos, `POST /auth/sign-in` com credenciais corretas retorna **200**, body contém `token` (string não-vazia) e `user` com `{ id, name, email, created_at, updated_at }`; `user.email` bate, e o body **não** expõe `password`.
2. **401 senha incorreta** — usuário existe, mas senha errada → **401**, mensagem genérica (`"Incorrect e-mail or password"`), sem `token`.
3. **401 email inexistente** — nenhum usuário com aquele email → **401**, mesma mensagem genérica (verificar que não vaza se o email existe ou não).
4. **422 input inválido** — body sem `email`/`password`, ou `email` malformado → **422** (mapeado de `ValidationError` pelo adapter via Zod `safeParse`).

> Observação para o validador: o `inputSchema` do controller exige `email` válido (`z.email()`) e `password: z.string()`. Um body `{}` cai em 422. Confirme o status exato observando o `errorCodeMap` do adapter (422 para `ValidationError`, 401 para `UnauthorizedError`).
