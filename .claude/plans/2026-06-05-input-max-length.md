# Input Max Length Hardening

## Objective

Add a maximum character limit (`.max(N)`) to every free-text `z.string()` field
across the HTTP input schemas (controllers) and the corresponding domain entity
schemas. Unbounded text fields allow arbitrarily long strings, which is a DoS
vector — most critically `password`, since bcrypt/argon2 hashing of very long
inputs blocks the event loop. This change adds the missing limits without
altering any business logic.

## Personas

- **Arquiteto** (`.claude/personas/arquiteto.md`) — produced this plan and the
  field-by-field mapping and limit decisions.
- **Desenvolvedor** (`.claude/personas/desenvolvedor.md`) — implements the
  `.max()` additions per the guidelines below.
- **Analista de Segurança** (`.claude/personas/analista_seguranca.md`) —
  post-implementation security/LGPD review (DoS surface, no PII leakage in
  error messages).

## Limit Reference Table

| Field type                        | Limit | Rationale                          |
| --------------------------------- | ----- | ---------------------------------- |
| `password`                        | 128   | bcrypt safe input ceiling, DoS     |
| `email`                           | 255   | RFC 5321 max address length        |
| `name` / free text (person/place) | 100   | Generous human-name / label limit  |
| address line (street, city, etc.) | 100   | Free-text address component        |
| `zip_code`                        | 20    | Covers international postal codes  |
| `complement`                      | 100   | Free-text address note             |
| `category` (finance)              | 50    | Short enum-like label              |
| `description` (finance free text) | 500   | Long-form note, still bounded      |
| `sync_url` (external integration) | 2048  | De-facto browser/URL max length    |
| `phone`                           | 15/20 | Already bounded in tenant (max 15) |

> Numeric fields, dates, enums, and UUIDs are out of scope — they are not
> `z.string()` free text and already constrain length implicitly.

## Mapped Changes

### Auth

**`src/auth/presentation/controller/auth/register_user.controller.ts`**

- `name: z.string().min(3)` → add `.max(100, "Name must be at most 100 characters")`
- `email: z.email()` → add `.max(255, "Email must be at most 255 characters")`
- `password: z.string().min(8)` → add `.max(128, "Password must be at most 128 characters")` **(critical — DoS)**

**`src/auth/presentation/controller/auth/sign_in.controller.ts`**

- `email: z.email()` → add `.max(255, "Email must be at most 255 characters")`
- `password: z.string()` → add `.max(128, "Password must be at most 128 characters")` **(critical — DoS)**

**`src/auth/domain/entity/user.ts`** (`userSchema`)

- `name: z.string().min(1)` → add `.max(100)`
- `email: z.string().email()` → add `.max(255)`
- `password: z.string().min(8)` → add `.max(128)` **(domain invariant — critical)**

### Booking

**`src/booking/presentation/controller/property/book_stay.controller.ts`**

- `tenant.name: z.string().min(2, "Name is required")` → add `.max(100, "Name must be at most 100 characters")`
- `tenant.phone: z.string().length(13)` — already bounded (OK, no change)
- `entrance_code: z.string().length(7, ...)` — already bounded (OK)
- `source: z.string().max(100)` — already bounded (OK)

**`src/booking/presentation/controller/property/create_external_booking.controller.ts`**

- `sync_url: z.url()` → add `.max(2048, "Sync URL must be at most 2048 characters")`
- `property_id: z.string()` → tighten to `z.uuid("Property ID must be a valid UUID")` (UUID already implies bounded length; this also fixes a latent validation gap). If a non-UUID change is undesired, fall back to `z.string().max(100)`.

**`src/booking/domain/entity/tenant.ts`** (`tenantSchema`)

- `name: z.string().min(3)` → add `.max(100)`
- `phone` — already `.max(15)` (OK)

**`src/booking/domain/entity/external_booking_source.ts`** (`externalBookingSourceSchema`)

- `sync_url: z.url()` → add `.max(2048)` (domain invariant)

> `src/booking/domain/entity/stay.ts` — `entrance_code` (`.length(7)`) and
> `source` (`.max(100)`) are already bounded. No change.

### Finance

**`src/finance/presentation/controller/record_expense.controller.ts`**

- `description: z.string().optional()...` → add `.max(500, "Description must be at most 500 characters")` before `.optional()`
- `category: z.string().min(1, "Category is required")` → add `.max(50, "Category must be at most 50 characters")`

**`src/finance/presentation/controller/record_revenue.controller.ts`**

- `description: z.string().optional()...` → add `.max(500, "Description must be at most 500 characters")` before `.optional()`
- `category: z.string().min(1, "Category is required")` → add `.max(50, "Category must be at most 50 characters")`

**`src/finance/domain/entity/ledger_entry.ts`** (`ledgerEntrySchema`)

- `description: z.string().nullable()` → add `.max(500)` before `.nullable()`
- `category: z.string()` → add `.max(50)` (domain invariant)

### Property Management

**`src/property_management/presentation/controller/create_property.controller.ts`** (`addressSchema` + `inputSchema`)

- `name: z.string().min(1, "Name is required")` → add `.max(100, "Name must be at most 100 characters")`
- `address.street` → add `.max(100, "Street must be at most 100 characters")`
- `address.number` → add `.max(20, "Number must be at most 20 characters")`
- `address.neighborhood` → add `.max(100, "Neighborhood must be at most 100 characters")`
- `address.city` → add `.max(100, "City must be at most 100 characters")`
- `address.state` → add `.max(100, "State must be at most 100 characters")`
- `address.zip_code` → add `.max(20, "Zip code must be at most 20 characters")`
- `address.country` → add `.max(100, "Country must be at most 100 characters")`
- `address.complement: z.string().default("")` → add `.max(100, "Complement must be at most 100 characters")` before `.default("")`
- `images: z.array(z.string())` — each entry is effectively a URL; add `z.string().max(2048)` on the array element to cap individual image strings.

**`src/property_management/presentation/controller/update_property.controller.ts`** (`addressSchema` + `inputSchema`)

- Apply the exact same `.max()` additions as `create_property` for `name`,
  all address fields, `complement`, and the `images` array element.

**`src/property_management/domain/value_object/address.ts`** (`addressSchema`)

- Apply the same address-field `.max()` limits (domain invariant): `street`,
  `number`, `neighborhood`, `city`, `state`, `zip_code`, `country`, `complement`.

**`src/property_management/domain/entity/property.ts`** (`propertySchema`)

- `name` → `.max(100)`
- inline `address.*` fields → same `.max()` limits as above
- `images` array element → `z.string().max(2048)`

> Note: the address schema is duplicated in three places (controllers, the
> `address` value object, and the inline `address` in `propertySchema`). All
> must receive matching limits. A follow-up refactor to share a single
> `addressSchema` is recommended but **out of scope** for this task.

### Controllers with no free-text input (no change required)

- `src/auth/presentation/controller/auth/get_user.controller.ts` — no inputSchema
- `src/auth/presentation/controller/auth/purge_user_data.controller.ts` — no inputSchema
- `src/booking/presentation/controller/property/reconcile_external_booking.controller.ts` — no inputSchema
- `src/booking/presentation/controller/stay/cancel_stay.controller.ts` — UUID only
- `src/booking/presentation/controller/stay/find_property_stays.controller.ts` — UUID/date/number only
- `src/booking/presentation/controller/stay/get_public_stay.controller.ts` — UUID only
- `src/booking/presentation/controller/stay/get_stay.controller.ts` — UUID only
- `src/booking/presentation/controller/stay/update_stay.controller.ts` — UUID/date/number only
- `src/booking/presentation/controller/tenant/list_tenants.controller.ts` — no inputSchema
- `src/finance/presentation/controller/find_property_financial_movements.controller.ts` — UUID/date/number only
- `src/property_management/presentation/controller/find_property.controller.ts` — UUID only
- `src/property_management/presentation/controller/find_user_properties.controller.ts` — no inputSchema
- `src/core/presentation/controller/health/health.controller.ts` — no inputSchema

## Developer Guidelines

- Add `.max(N)` only — do not touch business logic, ordering of validators
  (place `.max()` adjacent to existing `.min()`/`.length()`), or use-case code.
- Zod error messages must be in **English** and descriptive, e.g.
  `"Password must be at most 128 characters"`.
- For a field that is `.optional()` / `.nullable()` / `.default()`, the `.max()`
  must come **before** those modifiers (apply on the base `z.string()`).
- Where the controller and the domain entity both validate the same field, add
  the limit in **both** places: the controller is the HTTP boundary; the entity
  is the domain invariant.
- `email: z.email()` (Zod v4 top-level format) still supports `.max()` chaining;
  apply `.max(255)` directly.
- After each modified file (or each logical group), create a Conventional Commit
  per the project convention (`fix:` or `chore:`), as required by CLAUDE.md.
- Run `bun run lint:check` and `bun run format:check` before finishing.

## Tasks

1. **Auth limits** — add `.max()` to `register_user` and `sign_in` controllers and to `userSchema` in `user.ts` (`password` 128, `email` 255, `name` 100).
   - Dependencies: none
2. **Booking limits** — add `.max()` to `book_stay` (`tenant.name`) and `create_external_booking` (`sync_url`, tighten `property_id`) controllers, and to `tenantSchema` (`name`) and `externalBookingSourceSchema` (`sync_url`).
   - Dependencies: none
3. **Finance limits** — add `.max()` to `record_expense` and `record_revenue` controllers (`description`, `category`) and to `ledgerEntrySchema`.
   - Dependencies: none
4. **Property management limits** — add `.max()` to `create_property` and `update_property` controllers, to the `address` value object schema, and to the inline `propertySchema` address + `name` + `images`.
   - Dependencies: none
5. **Lint, format & verify** — run `bun run lint:check` and `bun run format:check`; fix any formatting drift introduced by the edits.
   - Dependencies: tasks 1, 2, 3, 4
6. **Security review** — Analista de Segurança validates the DoS surface is closed (especially `password`) and that no new error message leaks PII.
   - Dependencies: task 5

> Tasks 1–4 share no dependencies and can be executed in parallel by multiple
> agents. Tasks 5 and 6 are sequential gates.
