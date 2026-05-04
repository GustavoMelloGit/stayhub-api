# Adicionar filtro por data de check-in na listagem de estadias

## Objective

Substituir o filtro booleano `onlyIncomingStays` por dois filtros opcionais de data (`start_check_in_date` e `end_check_in_date`) no endpoint de listagem de estadias por propriedade. Com isso, o cliente passa a ter controle granular sobre o intervalo de datas desejado.

## Personas

None identified.

## Mapped Changes

- **`src/booking/domain/repository/stay_repository.ts`** — Atualizar o tipo `AllFromPropertyFilters` removendo `onlyIncomingStays: boolean` e adicionando `start_check_in_date?: Date` e `end_check_in_date?: Date`
- **`src/booking/application/use_case/stay/find_property_stays.ts`** — Atualizar o tipo `InputFilters` e repassar os novos campos ao repositório
- **`src/booking/infra/database/postgres_repository/stay_postgres_repository.ts`** — Substituir a condição `onlyIncomingStays` por cláusulas `gte`/`lte` sobre `check_in`; importar `lte` do `drizzle-orm`
- **`src/booking/presentation/controller/stay/find_property_stays.controller.ts`** — Atualizar o schema Zod, extração dos query params e repasse dos filtros ao use case

## Tasks

1. **Atualizar tipo `AllFromPropertyFilters` no repositório de domínio** — Remover `onlyIncomingStays` e adicionar `start_check_in_date?: Date` e `end_check_in_date?: Date`
   - Dependencies: none

2. **Atualizar o use case `FindPropertyStaysUseCase`** — Alterar `InputFilters` e repassar os novos campos na chamada ao repositório
   - Dependencies: task 1

3. **Atualizar a implementação Drizzle `StayPostgresRepository`** — Substituir a cláusula `onlyIncomingStays` por `gte`/`lte` sobre `check_in`; importar `lte`
   - Dependencies: task 1

4. **Atualizar o controller `FindPropertyStaysController`** — Atualizar schema Zod, extração de query params e filtros repassados ao use case
   - Dependencies: task 2

> Tasks 2 e 3 não têm dependência entre si e podem ser executadas em paralelo por múltiplos agentes.
