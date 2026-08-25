# Prisma 8 Database Workflow

## First-time empty database

```text
contract emit
    ↓
db init
    ↓
db verify
```

`db init` bootstraps the database and signs it against the current contract.

## Normal schema changes

```text
Edit contract
    ↓
contract emit
    ↓
migration plan
    ↓
Review migration
    ↓
migrate
    ↓
db verify
```

## Verification

```bash
npx prisma@next db verify
```

Checks that:

- The database marker matches the emitted contract.
- The live database schema satisfies the contract.

`db verify` does not modify the database.

## Important distinction

- `db init` → bootstrap a new database
- `migration plan` → create a reviewable migration
- `migrate` → apply migrations
- `db verify` → check database state
- `db update` → directly reconcile an existing database with the contract
