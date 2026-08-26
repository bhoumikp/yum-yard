# YumYard — Recipe Discovery API

## Overview

Recipe Discovery is the first major YumYard feature.

The API allows users to discover published recipes using:

- Pagination
- Search
- Category filter
- Cuisine filter
- Type filter
- Difficulty filter
- Maximum cooking-time filter

Base API:

```text
/api/v1/recipes
```

---

# 1. Endpoint

```http
GET /api/v1/recipes
```

Example:

```http
GET /api/v1/recipes?page=1&limit=12
```

---

# 2. API Versioning

YumYard APIs use:

```text
/api/v1/
```

The version belongs at the API boundary.

Examples:

```text
/api/v1/recipes
/api/v1/auth/login
/api/v1/users
```

This allows future breaking changes to be introduced under:

```text
/api/v2/
```

without immediately breaking existing clients.

---

# 3. Query Parameters

## Pagination

### `page`

Specifies which page to retrieve.

```text
?page=2
```

Default:

```text
1
```

Minimum:

```text
1
```

---

### `limit`

Specifies how many recipes to return.

```text
?limit=12
```

Default:

```text
12
```

Minimum:

```text
1
```

Maximum:

```text
50
```

The maximum protects the API from requests such as:

```text
?limit=1000000
```

---

# 4. Search

### `search`

Searches recipe title and description.

```http
GET /api/v1/recipes?search=pasta
```

Search is case-insensitive.

The query uses PostgreSQL `ILIKE` through Prisma.

Conceptually:

```sql
title ILIKE '%pasta%'
OR
description ILIKE '%pasta%'
```

---

# 5. Category Filter

### `category`

Filters recipes by category.

```http
GET /api/v1/recipes?category=Dinner
```

Examples:

```text
Breakfast
Lunch
Dinner
Dessert
Snacks
```

Category represents the meal/category classification.

---

# 6. Type Filter

### `type`

Filters by dietary/food type.

```http
GET /api/v1/recipes?type=Vegetarian
```

Examples:

```text
Vegetarian
Non-Vegetarian
Egg
Vegan
```

Type is different from category.

```text
Category → Dinner
Type     → Vegetarian
```

---

# 7. Cuisine Filter

### `cuisine`

Filters recipes by cuisine.

```http
GET /api/v1/recipes?cuisine=Indian
```

Examples:

```text
Indian
Italian
Mexican
Chinese
```

Cuisine describes the culinary origin/style of the recipe.

---

# 8. Difficulty Filter

### `difficulty`

Filters recipes by difficulty.

```http
GET /api/v1/recipes?difficulty=Easy
```

Expected values:

```text
Easy
Medium
Hard
```

---

# 9. Cooking-Time Filter

### `maxCookingTime`

Returns recipes whose cooking time is less than or equal to the requested value.

```http
GET /api/v1/recipes?maxCookingTime=30
```

Meaning:

```text
cookingTimeMinutes <= 30
```

Prisma comparison operator:

```ts
r.cookingTimeMinutes.lte(30);
```

Useful comparison operators:

```text
lt   → less than
lte  → less than or equal
gt   → greater than
gte  → greater than or equal
```

---

# 10. Combining Filters

Filters can be combined.

Example:

```http
GET /api/v1/recipes?search=pasta&category=Dinner&type=Vegetarian
```

Conceptually:

```text
status = PUBLISHED
AND
(
  title contains "pasta"
  OR
  description contains "pasta"
)
AND
category = "Dinner"
AND
type = "Vegetarian"
```

Another example:

```http
GET /api/v1/recipes?cuisine=Indian&type=Vegetarian&difficulty=Easy&maxCookingTime=30
```

The API applies all supplied filters.

---

# 11. Published Recipes Only

Recipe Discovery only exposes recipes whose status is:

```text
PUBLISHED
```

The base query therefore starts with:

```ts
let query = db.orm.public.Recipe.where({ status: "PUBLISHED" });
```

Draft or archived recipes should not appear in public discovery.

---

# 12. Query Composition

The discovery query is built incrementally.

```ts
let query = db.orm.public.Recipe.where({ status: "PUBLISHED" });
```

Then optional filters are added:

```ts
if (search) {
  query = query.where(...);
}

if (category) {
  query = query.where({ category });
}

if (cuisine) {
  query = query.where({ cuisine });
}

if (type) {
  query = query.where({ type });
}

if (difficulty) {
  query = query.where({ difficulty });
}

if (maxCookingTime !== null) {
  query = query.where(...);
}
```

This allows different filters to be combined without creating separate endpoints.

---

# 13. Prisma Query Concepts

## `where()`

Filters records.

```ts
.where({ status: 'PUBLISHED' })
```

Conceptually:

```sql
WHERE status = 'PUBLISHED'
```

---

## `orderBy()`

Controls result ordering.

```ts
.orderBy((r) => r.createdAt.desc())
```

Newest recipes appear first.

Conceptually:

```sql
ORDER BY createdAt DESC
```

---

## `skip()`

Skips records belonging to previous pages.

```ts
.skip(skip)
```

---

## `take()`

Limits the number of returned records.

```ts
.take(limit)
```

---

## `all()`

Executes the query and returns all matching records.

```ts
.all()
```

---

## `aggregate()`

Performs database aggregation.

We use it to calculate the total number of matching recipes:

```ts
const total = await query.aggregate((r) => ({
  count: r.count(),
}));
```

This allows pagination metadata to use the same filters as the recipe query.

---

# 14. Pagination Calculation

The number of records to skip is:

```ts
const skip = (page - 1) * limit;
```

Example:

```text
page 1, limit 12
skip = 0

page 2, limit 12
skip = 12

page 3, limit 12
skip = 24
```

Total pages:

```ts
const totalPages = Math.ceil(total.count / limit);
```

Example:

```text
total = 27
limit = 12

27 / 12 = 2.25

Math.ceil(2.25) = 3
```

Therefore:

```text
Page 1 → 12 recipes
Page 2 → 12 recipes
Page 3 → 3 recipes
```

---

# 15. Query Parameter Validation

Query parameters come from an HTTP request and should be treated as untrusted input.

Example:

```ts
const pageValue = Number(req.query.page);

const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
```

For `limit`:

```ts
const limitValue = Number(req.query.limit);

const limit =
  Number.isInteger(limitValue) && limitValue > 0
    ? Math.min(limitValue, 50)
    : 12;
```

For string filters:

```ts
const search =
  typeof req.query.search === "string" ? req.query.search.trim() : "";
```

This prevents unexpected query values from entering application logic.

General rule:

```text
HTTP request
    ↓
Untrusted input
    ↓
Validate / normalize
    ↓
Application logic
    ↓
Database
```

---

# 16. API Response

Successful response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

### `data`

Contains the recipes for the current page.

### `pagination`

Contains metadata required by the frontend.

```text
page
limit
total
totalPages
```

Pagination is an object, not an array.

Correct:

```json
"pagination": {
  "page": 1
}
```

Not:

```json
"pagination": [
  {
    "page": 1
  }
]
```

---

# 17. Consistent Count Query

The recipe query and count query must use the **same filters**.

Correct:

```text
Filtered query
     ↓
 ┌───┴────┐
 ↓        ↓
recipes   count
```

Example:

```text
100 published recipes
20 match "pasta"
```

Request:

```http
GET /api/v1/recipes?search=pasta
```

Should return:

```json
{
  "pagination": {
    "total": 20
  }
}
```

Not:

```json
{
  "pagination": {
    "total": 100
  }
}
```

This keeps pagination accurate.

---

# 18. Current Route Structure

Current backend routing:

```text
src/
├── routes/
│   ├── index.ts
│   └── recipe.routes.ts
│
├── prisma/
│   ├── contract.ts
│   ├── contract.json
│   ├── contract.d.ts
│   └── db.ts
│
├── app.ts
└── server.ts
```

API routing:

```text
/api/v1
    │
    ├── /
    ├── /health
    │
    └── /recipes
```

Therefore:

```text
GET /api/v1/
GET /api/v1/health
GET /api/v1/recipes
```

---

# 19. Current Recipe Discovery Query Flow

```text
HTTP Request
     ↓
GET /api/v1/recipes
     ↓
Validate query parameters
     ↓
Create base Recipe query
     ↓
status = PUBLISHED
     ↓
Apply search
     ↓
Apply category
     ↓
Apply cuisine
     ↓
Apply type
     ↓
Apply difficulty
     ↓
Apply max cooking time
     ↓
Count matching records
     ↓
Order by createdAt DESC
     ↓
Skip
     ↓
Take
     ↓
Return JSON
```

---

# 20. Example Requests

Basic:

```http
GET /api/v1/recipes
```

Pagination:

```http
GET /api/v1/recipes?page=2&limit=12
```

Search:

```http
GET /api/v1/recipes?search=pasta
```

Category:

```http
GET /api/v1/recipes?category=Dinner
```

Cuisine:

```http
GET /api/v1/recipes?cuisine=Indian
```

Type:

```http
GET /api/v1/recipes?type=Vegetarian
```

Difficulty:

```http
GET /api/v1/recipes?difficulty=Easy
```

Cooking time:

```http
GET /api/v1/recipes?maxCookingTime=30
```

Combined:

```http
GET /api/v1/recipes?search=pasta&category=Dinner&type=Vegetarian&difficulty=Easy&maxCookingTime=30&page=1&limit=12
```

---

# 22. Development Principle

Keep the Recipe Discovery API simple.

Do not introduce abstractions just because code appears reusable.

For example, pagination is currently implemented directly in the Recipe route.

If another feature later needs the same pagination behavior, then extract the common implementation.

Rule:

```text
First real implementation
        ↓
Observe repetition
        ↓
Identify actual pattern
        ↓
Extract abstraction
```

Do not abstract hypothetical future requirements.
