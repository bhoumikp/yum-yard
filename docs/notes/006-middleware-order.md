# Middleware Order

The general Express structure should be:

```text
Express App
    ↓
CORS
    ↓
Body Parsers
    ↓
API Routes
    ↓
Error Middleware
```

Example:

```ts
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use(errorMiddleware);
```

The error middleware should be registered **after the routes** so it can handle errors passed down from them.
