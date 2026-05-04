# Adicionar filtro por data de check-in na listagem de estadias

## Objective

Substituir o filtro booleano `onlyIncomingStays` por dois parâmetros de janela temporal (`from` e `to`) com semântica de **overlap**: retorna todas as estadias cujo intervalo `[check_in, check_out]` intersecta `[from, to]`. Objetivo: alimentar um calendário de ocupação no frontend que exibe mês a mês as estadias de uma propriedade.

## Personas

- **Arquiteto** — revisão de domínio e aprovação do plano ✅
- **Desenvolvedor** — implementação das tasks

## Decisões Arquiteturais

- **Semântica:** overlap (`check_in <= to AND check_out >= from`), não filtro pontual por campo
- **Parâmetros:** `from` e `to`, ambos obrigatórios, formato ISO 8601 date-only (`YYYY-MM-DD`)
- **Breaking change:** `onlyIncomingStays` removido sem retrocompatibilidade (aprovado)
- **Validação:** `from <= to` obrigatória no schema Zod; falha lança `ValidationError`
- **Ordenação:** `orderBy(asc(check_in))` na query do repositório
- **Fora de escopo:** limite máximo de janela, cache HTTP

## Mapped Changes

- **`src/booking/domain/repository/stay_repository.ts`** — Substituir `onlyIncomingStays: boolean` por `from: Date` e `to: Date` no tipo `AllFromPropertyFilters`
- **`src/booking/application/use_case/stay/find_property_stays.ts`** — Substituir `onlyIncomingStays` por `from: Date` e `to: Date` em `InputFilters`; repassar ao repositório
- **`src/booking/infra/database/postgres_repository/stay_postgres_repository.ts`** — Substituir cláusula `onlyIncomingStays` por `lte(check_in, to)` e `gte(check_out, from)`; importar `lte`; adicionar `orderBy(asc(check_in))`
- **`src/booking/presentation/controller/stay/find_property_stays.controller.ts`** — Atualizar schema Zod para `from: z.coerce.date()` e `to: z.coerce.date()` com refinement `from <= to`; extrair dos query params; repassar ao use case

## Tasks

1. **Atualizar `AllFromPropertyFilters` no repositório de domínio** — Remover `onlyIncomingStays: boolean`, adicionar `from: Date` e `to: Date`
   - Dependencies: none

2. **Atualizar o use case `FindPropertyStaysUseCase`** — Substituir `onlyIncomingStays` por `from` e `to` em `InputFilters`; repassar ao repositório
   - Dependencies: task 1

3. **Atualizar a implementação Drizzle `StayPostgresRepository`** — Substituir cláusula por overlap (`lte(check_in, to)` + `gte(check_out, from)`); importar `lte`; adicionar `orderBy(asc(check_in))`
   - Dependencies: task 1

4. **Atualizar o controller `FindPropertyStaysController`** — Schema Zod com `z.coerce.date()` para `from`/`to`; refinement `from <= to`; extração dos query params; repasse ao use case
   - Dependencies: task 2

> Tasks 2 e 3 não têm dependência entre si — podem ser executadas em paralelo.
