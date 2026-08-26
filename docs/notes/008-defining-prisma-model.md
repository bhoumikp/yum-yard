# Prisma 8 — Defining a Model

This note covers the complete workflow we used in YumYard to define a database model using the Prisma 8 TypeScript contract builder.

---

# 1. Understand the Domain Model First

Before writing Prisma code, decide what the model represents and what data it needs.

Example:

```text
Recipe
├── id
├── title
├── description
├── imageUrl
├── category
├── type
├── cuisine
├── difficulty
├── cookingTimeMinutes
├── authorId
├── status
├── createdAt
└── updatedAt
```

A model should represent a real domain entity.

For YumYard:

```text
User
Recipe
```

are domain entities.

---

# 2. Define the Model

Prisma 8 TypeScript contracts use `model()`.

```ts
const Recipe = model("Recipe", {
  fields: {
    // fields
  },
});
```

Conceptually:

```text
model()
   ↓
Prisma model
   ↓
PostgreSQL table
```

For example:

```ts
const Recipe = model("Recipe", {
  fields: {
    title: field.text(),
  },
});
```

creates the definition of a `Recipe` model containing a `title` field.

---

# 3. Define the ID

Every model needs an identifier.

YumYard uses UUIDv7 IDs:

```ts
id: field.id.uuidv7String(),
```

### Meaning

```text
field
  ↓
id
  ↓
uuidv7String()
```

This defines the model's ID field and configures UUIDv7 generation.

We use the same pattern for `User` and `Recipe`.

---

# 4. Define Scalar Fields

Fields describe the data stored by the model.

### Text

```ts
title: field.text(),
```

Creates a text field.

### Integer

```ts
cookingTimeMinutes: field.int(),
```

Creates an integer field.

### Optional field

```ts
description: field.text().optional(),
```

`.optional()` means the database value can be absent/null.

Example:

```text
description
├── "A spicy Indian curry"
└── null
```

### Unique field

```ts
email: field.text().unique(),
```

`.unique()` means duplicate values are not allowed.

Our User model uses this for email:

```ts
email: field.text().unique(),
```

---

# 5. Understand ID Fields vs UUID Fields

These are not the same:

```ts
field.id.uuidv7String();
```

and:

```ts
field.uuidString();
```

### Model ID

```ts
id: field.id.uuidv7String(),
```

This defines the model's generated identifier.

### UUID value

```ts
authorId: field.uuidString(),
```

This stores a UUID value.

For a foreign-key-like field such as `authorId`, we don't want it generating its own ID.

Instead:

```text
Recipe.authorId
       ↓
stores
       ↓
User.id
```

---

# 6. Define Relationships

Relationships describe how models connect.

YumYard has:

```text
User 1 ─────── * Recipe
```

One user can have many recipes.

---

## 6.1 Define the User Side

```ts
User.relations({
  recipes: rel.hasMany(Recipe, {
    by: "authorId",
  }),
});
```

`hasMany()` means:

> One User can be related to many Recipe records.

The `by` field tells Prisma which Recipe field connects the relationship.

```text
User.id
   ↑
   │
Recipe.authorId
```

---

## 6.2 Define the Recipe Side

```ts
Recipe.relations({
  author: rel.belongsTo(User, {
    from: "authorId",
    to: "id",
  }),
});
```

`belongsTo()` means:

> A Recipe belongs to one User.

The relationship is:

```text
Recipe.authorId → User.id
```

This gives us:

```ts
recipe.author;
```

conceptually representing the owning User.

---

# 7. Use Domain Names for Relationships

Prefer:

```ts
author: rel.belongsTo(...)
```

instead of:

```ts
user: rel.belongsTo(...)
```

because:

```ts
recipe.author;
```

expresses the actual domain concept.

The database relationship is technically User → Recipe, but the Recipe's relationship is semantically an **author**.

Good naming matters because it makes the ORM code easier to understand.

---

# 8. Physical Table Mapping

Prisma 8 supports SQL/storage mapping through `.sql()`.

For example:

```ts
Recipe.sql({
  table: "recipes",
});
```

This separates the application model name:

```text
Recipe
```

from the PostgreSQL table name:

```text
recipes
```

### Important

Don't introduce table mappings casually.

If the database already contains:

```text
"User"
```

and we change the contract to:

```ts
.sql({
  table: 'users',
})
```

Prisma may interpret that as:

```text
DROP "User"
CREATE "users"
```

which can become a destructive migration.

Always review the migration before applying it.

---

# 9. Register Models in the Contract

Defining a model isn't enough.

Both models must be returned from the contract:

```ts
return {
  models: {
    User: User.relations({
      recipes: rel.hasMany(Recipe, {
        by: "authorId",
      }),
    }),

    Recipe: Recipe.relations({
      author: rel.belongsTo(User, {
        from: "authorId",
        to: "id",
      }),
    }),
  },
};
```

This makes the models part of the actual Prisma contract.

---

# 10. Emit the Contract

After changing `contract.ts`:

```bash
npx prisma@next contract emit
```

This generates:

```text
src/prisma/contract.json
src/prisma/contract.d.ts
```

### Why?

The TypeScript contract is our source definition.

Prisma compiles it into artifacts that the CLI and typed ORM client use.

```text
contract.ts
    ↓
contract emit
    ↓
contract.json
contract.d.ts
```

`contract.d.ts` also provides the generated TypeScript information used by the database client and editor.

---

# 11. Review the Generated Contract

Before changing the database, verify that Prisma understood the model.

Useful checks include:

```bash
grep -n "Recipe" src/prisma/contract.d.ts
```

and:

```bash
grep -n "author" src/prisma/contract.d.ts
```

The generated contract should show:

```text
Recipe
└── author
    └── User
```

and:

```text
User
└── recipes
    └── Recipe
```

This confirms the relationship exists in Prisma's generated contract.

---

# 12. Create a Migration

Once the contract is correct, create a migration plan:

```bash
npx prisma@next migration plan --name add-recipe
```

Example:

```text
migrations/app/20260826T0549_add_recipe
└── Create table "Recipe"
```

### Why migration planning exists

It converts:

```text
Desired contract
       ↓
Database changes
```

into a reviewable migration.

The migration might contain:

```sql
CREATE TABLE "public"."Recipe" (...);
```

---

# 13. Always Review the Migration

Never blindly apply a migration.

Look at:

```text
migrations/app/<migration-name>
```

and inspect the CLI's DDL preview.

Look especially for:

```text
DROP TABLE
DROP COLUMN
ALTER COLUMN
```

Destructive operations require extra attention.

For example, we encountered:

```text
⚠ Drop table "User"
```

because a physical table mapping had changed.

We rejected that migration and generated the correct one instead.

---

# 14. Apply the Migration

Once the migration is correct:

```bash
npx prisma@next db migrate
```

This applies the migration to PostgreSQL.

The normal workflow is:

```text
Contract
   ↓
contract emit
   ↓
migration plan
   ↓
Review
   ↓
db migrate
```

---

# 15. Check Migration Status

After applying:

```bash
npx prisma@next migration status
```

A successful result should show the migration as:

```text
✓ applied
```

and:

```text
✔ Up to date
```

This verifies that Prisma's migration history agrees with the database.

---

# 16. Verify the Actual Database Schema

You can inspect the live database with:

```bash
npx prisma@next db schema
```

This introspects PostgreSQL and shows the actual tables and columns.

For example:

```text
database
├─ table Recipe
│  ├─ columns
│  └─ primary key
└─ table User
   ├─ columns
   ├─ primary key
   └─ unique constraint
```

This answers:

> What actually exists in PostgreSQL?

---

# 17. Verify Contract vs Database

Finally:

```bash
npx prisma@next db verify
```

This checks that the database is consistent with the Prisma contract.

Conceptually:

```text
contract
   │
   ├── marker
   │
   └── expected schema
           ↓
       PostgreSQL
```

`db verify` does not fix the database.

It checks it.

---

# Complete Model Workflow

The complete process is:

```text
1. Understand domain
        ↓
2. Define model
        ↓
3. Define fields
        ↓
4. Define IDs
        ↓
5. Define relationships
        ↓
6. Register model in contract
        ↓
7. contract emit
        ↓
8. Review generated contract
        ↓
9. migration plan --name <meaningful-name>
        ↓
10. Review migration
        ↓
11. db migrate
        ↓
12. migration status
        ↓
13. db schema
        ↓
14. db verify
```

---

# YumYard Example

Our current Recipe model follows this structure:

```ts
const Recipe = model("Recipe", {
  fields: {
    id: field.id.uuidv7String(),

    title: field.text(),

    description: field.text().optional(),

    imageUrl: field.text().optional(),

    category: field.text(),

    type: field.text(),

    cuisine: field.text().optional(),

    difficulty: field.text(),

    cookingTimeMinutes: field.int(),

    authorId: field.uuidString(),

    status: field.text(),

    createdAt: field.temporal.createdAt(),

    updatedAt: field.temporal.updatedAt(),
  },
});
```

Relationship:

```ts
Recipe: Recipe.relations({
  author: rel.belongsTo(User, {
    from: 'authorId',
    to: 'id',
  }),
}),
```

Inverse relationship:

```ts
User: User.relations({
  recipes: rel.hasMany(Recipe, {
    by: 'authorId',
  }),
}),
```

---

# Prisma Concepts to Remember

| Concept                   | Meaning                                   |
| ------------------------- | ----------------------------------------- |
| Contract                  | Desired database/data model definition    |
| Model                     | Domain entity / database table            |
| Field                     | Model property / database column          |
| Relation                  | Connection between models                 |
| `field.text()`            | Text column                               |
| `field.int()`             | Integer column                            |
| `.optional()`             | Nullable/optional field                   |
| `.unique()`               | Unique constraint                         |
| `field.id.uuidv7String()` | Generated UUIDv7 model ID                 |
| `field.uuidString()`      | UUID value field                          |
| `rel.hasMany()`           | One-to-many relationship                  |
| `rel.belongsTo()`         | Many-to-one relationship                  |
| `contract emit`           | Compile contract into generated artifacts |
| `migration plan`          | Generate a reviewable schema change       |
| `db migrate`              | Apply migrations                          |
| `migration status`        | Check migration state                     |
| `db schema`               | Inspect actual database schema            |
| `db verify`               | Verify database against contract          |

---

# Rule for YumYard

When changing the database:

```text
Never:

Edit contract
    ↓
Immediately modify database
```

Instead:

```text
Edit contract
    ↓
Emit
    ↓
Review migration
    ↓
Apply migration
    ↓
Verify
```

The migration is part of the project's history and should be committed to Git.
