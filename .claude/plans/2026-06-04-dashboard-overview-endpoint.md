# Dashboard Overview Endpoint

## Objective

Criar o endpoint `GET /dashboard/overview` que agrega KPIs e próximas estadias para o usuário autenticado, servindo como base de dados para um dashboard no frontend. A feature reduz fricção operacional ao consolidar em um único request a visão de ocupação corrente, check-ins futuros, receita mensal realizada e próximas chegadas.

## Personas

- **Arquiteto** — análise de domínio e planejamento ✅
- **Desenvolvedor** — implementação das tasks (aguardando despacho)
- **Analista de Segurança** — revisão pós-desenvolvimento

## Decisões Arquiteturais

### Bounded context — REVISADA (questão devolvida pelo Orquestrador)

**Decisão: a feature permanece no BC Booking como um use case orquestrador. NÃO se cria um BC `reporting`/`dashboard`.**

Fundamentação:

- **Precedente já estabelecido no projeto.** `StayDi` (Booking) já instancia `PropertyPostgresRepository` (Property Management) e injeta em `GetStay`, `FindPropertyStays`, `CancelStay`, `UpdateStay`. `FindPropertyStaysUseCase` já compõe `PropertyRepository` + `StayRepository` e filtra por `property.user_id`. Coordenar leituras entre BCs **dentro do use case do BC consumidor** já é o padrão arquitetural vigente — o dashboard é mais um caso do mesmo padrão, não uma novidade que justifique um contexto novo.
- **Não há domínio próprio.** Um BC se justifica quando há linguagem ubíqua, invariantes e regras de negócio próprias. O dashboard não possui entidade, value object, política ou invariante alguma — é projeção/leitura sobre dados de outros contextos. Criar um BC para isso produziria uma pasta de domínio vazia (anêmica), violando o que a `architecture.md` chama de BC.
- **Centro de gravidade em Booking.** 3 dos 4 campos (`active_stays`, `upcoming_check_ins`, `upcoming_stays`) derivam de `Stay`/`Tenant`. `upcoming_stays` já precisa de `tenant.name` (Booking) + `property_name` (Property Management), exatamente a composição que o Booking já faz hoje. O Booking é o consumidor natural.

**Quando um BC `reporting` se justificaria (não é o caso aqui):** quando o reporting acumula múltiplos relatórios com lógica de agregação própria e crescente; quando exige um read model materializado/desnormalizado mantido por eventos (CQRS), desacoplado do modelo transacional; ou quando a performance/volume exige uma fonte de dados separada. Nada disso se aplica a um único endpoint de overview que lê o estado atual. **Revisitar somente se surgir uma família de relatórios** — aí extrai-se `reporting` movendo este use case para lá. Decisão reversível e barata; antecipá-la agora é over-engineering.

### Fronteira do Finance — CORREÇÃO ao plano anterior

O plano original propunha adicionar `monthlyRevenue(userId, date)` ao repositório do Finance. **Isso vaza o conceito de `user` para dentro do Finance, que hoje raciocina exclusivamente por `propertyId`** (`propertyBalance(propertyId)`, `findByPropertyId(propertyId, ...)`). Para preservar a fronteira:

- O **Booking** resolve as propriedades do usuário (`PropertyRepository.allFromUser(userId)`), obtendo a lista de `propertyId`.
- O **Finance** ganha um método agregador **por propriedades**, não por usuário: `monthlyRevenueForProperties(propertyIds, date)`. O Finance continua sem conhecer `user`.
- O use case do dashboard (Booking) faz a ponte: `userId → propertyIds → monthlyRevenueForProperties`.

### Demais decisões

- **`monthly_revenue`:** usa `LedgerEntry` (Finance) — receita **realizada**, não contratada.
- **Cross-context Stay↔Property:** filtro de ownership e `property_name` via composição no use case do Booking, como já feito em `FindPropertyStays`.
- **Stays canceladas:** excluídas via `deleted_at IS NULL`.
- **Timezone:** `date` tratado como 00:00:00 UTC.
- **`date`:** opcional — default = data atual do servidor (UTC).
- **Performance:** resolução de propriedades primeiro; em seguida queries de Stay e Finance via `Promise.all` no use case.

## Mapped Changes

### Criar

- **`src/booking/application/use_case/dashboard/get_dashboard_overview.ts`** — use case `GetDashboardOverviewUseCase` no **BC Booking**. Input: `{ user_id, date? }`. Injeta três repositórios: `PropertyRepository` (Property Management), `StayRepository` (Booking) e `LedgerEntryRepository` (Finance). Fluxo: (1) `PropertyRepository.allFromUser(user_id)` → lista de `propertyId`; (2) `Promise.all([stayRepository.dashboardStats(propertyIds, date), ledgerEntryRepository.monthlyRevenueForProperties(propertyIds, date)])`; (3) monta DTO.
- **`src/booking/presentation/controller/dashboard/get_dashboard_overview.controller.ts`** — controller `GET /dashboard/overview`. Valida `date` (yyyy-MM-dd → Date, opcional, default hoje em UTC), injeta `user.id`, declara `openApiSpec`.

### Modificar

- **`src/booking/domain/repository/stay_repository.ts`** — adicionar `dashboardStats(propertyIds, date)` à interface e exportar `DashboardStatsResult` (active_stays count, upcoming_check_ins count, upcoming_stays list já com `tenant.name` via `StayWithTenant`). Assina por `propertyIds` (não por `userId`) — Booking não vaza ownership para a query, o ownership já foi resolvido no use case.
- **`src/booking/infra/database/postgres_repository/stay_postgres_repository.ts`** — implementar `dashboardStats` com `Promise.all` (count active, count upcoming 7d, findMany com join tenant + lookup `property_name` limit 5 order check_in asc), filtrando `property_id IN (propertyIds)` e `deleted_at IS NULL`.
- **`src/finance/domain/repository/ledger_entry_repository.ts`** — adicionar `monthlyRevenueForProperties(propertyIds: string[], date: Date)` à interface, retornando `number` (soma em centavos das entradas de receita do mês/ano de `date`). **Por propriedades, não por usuário** — preserva a fronteira do Finance, que continua sem conhecer `user`.
- **`src/finance/infra/database/postgres_repository/ledger_entry_postgres_repository.ts`** — implementar `monthlyRevenueForProperties` com `sum(amount)` filtrando por mês/ano de `date` em UTC e `property_id IN (propertyIds)`.
- **`src/booking/infra/di/stay_di.ts`** — adicionar `#ledgerEntryRepository` (instanciar o repositório Postgres do Finance, como já se faz com `PropertyPostgresRepository`), `makeGetDashboardOverviewUseCase` (injeta `PropertyRepository` + `StayRepository` + `LedgerEntryRepository`) e `makeGetDashboardOverviewController`.
- **`src/core/infra/http/routes/routes.ts`** — registrar rota `GET /dashboard/overview` autenticada (em `stayControllers`, via `stayDi.makeGetDashboardOverviewController()`).

> Sem migration de banco necessária. Nenhum arquivo em um BC novo — a feature usa exclusivamente Booking (use case + controller + DI) compondo repositórios de Property Management e Finance.

## Tasks

1. **Contrato Stay** — adicionar `dashboardStats(propertyIds, date)` à interface `StayRepository` e exportar `DashboardStatsResult`.
   - Dependencies: none

2. **Contrato Finance** — adicionar `monthlyRevenueForProperties(propertyIds, date)` à interface `LedgerEntryRepository` (por propriedades, não por usuário).
   - Dependencies: none

3. **Implementar dashboardStats no repositório Postgres (Stay)** — count active, count upcoming 7d, list upcoming 5 (com `tenant.name` e `property_name`), filtrando `property_id IN (propertyIds)`.
   - Dependencies: task 1

4. **Implementar monthlyRevenueForProperties no repositório Postgres (Finance)** — `sum(amount)` das receitas do mês em UTC, filtrado por `property_id IN (propertyIds)`.
   - Dependencies: task 2

5. **Criar o use case** — `get_dashboard_overview.ts` no Booking. Injeta `PropertyRepository` + `StayRepository` + `LedgerEntryRepository`. Resolve `propertyIds` via `allFromUser`, depois `Promise.all([dashboardStats, monthlyRevenueForProperties])`, monta DTO.
   - Dependencies: tasks 1, 2

6. **Criar o controller** — validação de `date` (opcional, default hoje UTC), `openApiSpec`, `handle`.
   - Dependencies: task 5

7. **Registrar no DI** — `stay_di.ts`: adicionar `#ledgerEntryRepository`, factories para use case e controller.
   - Dependencies: tasks 3, 4, 5, 6

8. **Registrar a rota** — `routes.ts`, `GET /dashboard/overview`, autenticada.
   - Dependencies: task 7

> Tasks 1 e 2 sem dependências — rodam em paralelo. Tasks 3 e 4 também rodam em paralelo entre si. Caminho crítico: (1‖2) → 5 → 6 → 7 → 8.
