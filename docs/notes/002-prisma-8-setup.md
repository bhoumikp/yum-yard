# Prisma 8 Setup

## Purpose

Set up Prisma 8 with the local PostgreSQL database for YumYard.

> YumYard currently uses Prisma 8 Release Candidate.

## 1. Initialize Prisma 8

From the backend directory:

```bash
npx prisma@next orm init
```

Selected options:

```text
Database:   PostgreSQL
Schema:     TypeScript (.ts)
Schema:     src/prisma/contract.ts
```

This generated:

```text
backend/
├── src/
│   └── prisma/
│       ├── contract.ts
│       └── db.ts
├── prisma.config.ts
└── prisma-next.md
```

It also installed:

```text
@prisma/orm-postgres
dotenv
@prisma/cli@next
@prisma/cli-engine
```

## 2. Configure Database Connection

Set `DATABASE_URL` in:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://yumyard:YOUR_LOCAL_PASSWORD@localhost:5432/yumyard"
```

## 3. Verify PostgreSQL Connection

Inspect the live database schema:

```bash
npx prisma@next db schema
```

Successful output confirms Prisma can connect to PostgreSQL and introspect the database.

## 4. Create Initial YumYard Contract

The generated Prisma starter contract contained example `User` and `Post` models.

For YumYard, the initial contract was reduced to the `User` model.

File:

```text
src/prisma/contract.ts
```

Current initial model:

```text
User
├── id
├── email
├── username
├── name
├── createdAt
└── updatedAt
```

## 5. Emit the Contract

After changing the contract:

```bash
npx prisma@next contract emit
```

This generates:

```text
src/prisma/contract.json
src/prisma/contract.d.ts
```

## 6. Initialize the Database

Because the local YumYard database was empty:

```bash
npx prisma@next db init
```

Prisma:

- introspected the database
- planned the initial database changes
- created the `User` table
- added the unique constraint on `email`
- created the database marker
- advanced the `db` reference

## 7. Verify

The database was successfully initialized against the contract.

The initial database contains:

```text
User
└── email UNIQUE
```

## Important Prisma 8 Commands

The Prisma 8 CLI uses a new contract-based workflow.

Useful commands:

```bash
npx prisma@next contract emit
npx prisma@next db schema
npx prisma@next db init
npx prisma@next db verify
npx prisma@next db sign --db <url>
npx prisma@next db update
npx prisma@next migration status
npx prisma@next migration plan
npx prisma@next migration new
```

### Do Not Use Older Prisma Workflow Commands

Do not assume Prisma 7 commands apply to Prisma 8.

For example:

```bash
npx prisma db pull
```

is not available in the Prisma 8 CLI workflow being used by this project.

Always check:

```bash
npx prisma@next --help
```

## Current Status

```text
Prisma 8 initialized      ✅
PostgreSQL connection     ✅
DATABASE_URL              ✅
Contract created          ✅
Contract emitted          ✅
Database initialized      ✅
User table created        ✅
Database marker created   ✅
```

## Development Principle

Do not create the entire YumYard database schema upfront.

Add models as features are implemented.

Example:

```text
Feature
   ↓
Required models
   ↓
Update contract
   ↓
Emit contract
   ↓
Plan/apply database changes
   ↓
Implement feature
```
