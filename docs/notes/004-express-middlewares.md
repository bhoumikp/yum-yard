# Express Middlewares

## 1. JSON Body Parser

```ts
app.use(express.json());
```

Parses incoming requests containing JSON.

Example request:

```http
POST /api/recipes
Content-Type: application/json
```

```json
{
  "title": "Chicken Curry",
  "difficulty": "easy"
}
```

After parsing:

```ts
req.body.title;
```

returns:

```text
Chicken Curry
```

### Flow

```text
HTTP Request
    ↓
JSON body
    ↓
express.json()
    ↓
req.body
```

---

## 2. URL-Encoded Body Parser

```ts
app.use(express.urlencoded({ extended: true }));
```

Parses URL-encoded form submissions.

Example:

```text
title=Chicken+Curry&difficulty=easy
```

Becomes:

```ts
req.body;
```

```json
{
  "title": "Chicken Curry",
  "difficulty": "easy"
}
```

### `extended: true`

Allows richer/nested form data to be parsed.

Example:

```text
recipe[title]=Chicken+Curry
recipe[difficulty]=easy
```

---

## 3. Which Parsers Does YumYard Need?

### `express.json()`

Important for the React frontend because the frontend will normally communicate with the API using JSON.

### `express.urlencoded()`

Useful for traditional form submissions and future HTMX/server-rendered functionality.
