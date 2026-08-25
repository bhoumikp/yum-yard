# Centralized Error Handling

## Purpose

Instead of handling errors separately in every route, Express can send errors to one centralized middleware.

Create:

```text
src/middleware/error.middleware.ts
```

```ts
import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error",
  });
};
```

Register it **after the routes**:

```ts
app.use(errorMiddleware);
```

Import:

```ts
import { errorMiddleware } from "./middleware/error.middleware";
```

## Request Flow

```text
Request
   ↓
Middleware
   ↓
Routes
   ↓
Error?
   ↓
errorMiddleware
   ↓
Response
```

## Why Centralize Errors?

Without centralized handling, every route may need to implement its own error response.

With centralized handling:

```ts
throw new Error("Something went wrong");
```

can eventually flow through the same error-handling system.

This also gives the API a consistent error-response format.

## Current Approach

Keep the first version simple:

```json
{
  "error": "Internal server error"
}
```

Later, when real features are implemented, we can introduce:

- Custom application errors
- Different HTTP status codes
- Validation errors
- Authentication/authorization errors
- Development vs production error details

Do not add those prematurely.
