# PhoneShelf

PhoneShelf is a minimal phone catalog with a Next.js frontend and an Express ES-module backend. It supports CRUD records, private S3 image uploads, Upstash Redis rate limiting, and cached structured AI comparisons through OpenRouter.

## Folder structure

```text
PhoneShelf/
├── backend/
│   ├── src/
│   │   ├── config/             Environment and MongoDB connection
│   │   ├── controllers/        HTTP handlers
│   │   ├── middleware/         Validation, rate limits, errors
│   │   ├── models/             Mongoose models
│   │   ├── routes/             Express routes
│   │   ├── schemas/            Zod schemas
│   │   └── services/           MongoDB, S3, Redis, and AI services
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── app/                    Next.js App Router pages
│   ├── components/             Reusable UI
│   ├── lib/api.js              Browser API client
│   └── .env.example
└── README.md
```

The backend is native JavaScript ES modules (`"type": "module"`). The frontend remains a separate Next.js application.

## Features

- Phone CRUD with MongoDB Atlas and Mongoose
- Strict Zod request validation
- Pagination and consistent JSON errors
- Private S3 image uploads with server-generated keys and presigned URLs
- Upstash Redis sliding-window rate limits
- OpenRouter `openrouter/free` model routing through the Vercel AI SDK
- Structured, validated AI comparison output
- Versioned Redis comparison caching
- Monochrome responsive catalog UI

## Install and run

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

The backend runs at `http://localhost:5000`. It refuses to start if required environment variables are missing.

### Frontend

In another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Environment variables

Backend: copy [backend/.env.example](./backend/.env.example) to `backend/.env`.

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/phoneshelf?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:3000
TRUST_PROXY=false

AWS_REGION=us-east-1
AWS_S3_BUCKET=phoneshelf-private-images
MAX_UPLOAD_BYTES=5242880
PRESIGNED_URL_TTL_SECONDS=900

UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-upstash-token

OPENROUTER_API_KEY=replace-with-openrouter-key
OPENROUTER_MODEL=openrouter/free
APP_URL=http://localhost:3000
COMPARISON_CACHE_TTL_SECONDS=86400
COMPARISON_CACHE_VERSION=v1
AI_TIMEOUT_MS=30000
```

Frontend: copy [frontend/.env.example](./frontend/.env.example) to `frontend/.env.local`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Never put MongoDB, AWS, Upstash, or OpenRouter credentials in the frontend or in a `NEXT_PUBLIC_*` variable.

## Provider setup

### MongoDB Atlas

Create a cluster and database user, add the development IP under Network Access, copy the Node.js driver connection string, and use `/phoneshelf` as the database name.

### Amazon S3

Use a private bucket with Block Public Access enabled. The backend IAM identity needs only `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `arn:aws:s3:::BUCKET/phoneshelf/*`.

Configure bucket CORS for the frontend:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

The browser uploads directly to a short-lived presigned PUT URL. MongoDB stores only a key such as `phoneshelf/<uuid>.jpg`. Private images are displayed through short-lived presigned GET URLs. Lifecycle rules should clean up incomplete or abandoned uploads.

### Upstash Redis

Create a Redis database and copy its REST URL and token. One module-level Redis client is shared by rate limiting and comparison caching.

### OpenRouter

Create an OpenRouter key and keep it only in `backend/.env`:

```env
OPENROUTER_API_KEY=replace-with-openrouter-key
OPENROUTER_MODEL=openrouter/free
```

The OpenRouter free router selects an available free model. Free model availability, quotas, context limits, latency, and structured-output behavior can vary. Set `OPENROUTER_MODEL` to a specific OpenRouter model when you need more predictable behavior and verify that model supports structured JSON output.

The backend uses the installed Vercel AI SDK 7 structured-output API:

```js
generateText({
  model: openrouter(model),
  output: Output.object({ schema }),
});
```

## API contract

All successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`.

### Health

#### `GET /api/health`

Response `200` when MongoDB is connected, otherwise `503`:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

### List phones

#### `GET /api/phones?page=1&limit=12`

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "_id": "mongodb-object-id",
      "brand": "Google",
      "model": "Pixel 9",
      "price": 799,
      "specifications": {
        "display": "6.3-inch OLED",
        "processor": "Tensor G4",
        "RAM": "12GB",
        "storage": "128GB",
        "battery": "4700mAh",
        "camera": "50MP main",
        "operatingSystem": "Android 14"
      },
      "imageKey": "phoneshelf/uuid.jpg",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get one phone

#### `GET /api/phones/:id`

Response `200`:

```json
{ "success": true, "data": { "brand": "Google", "model": "Pixel 9" } }
```

Invalid IDs return `400`. Missing records return `404`.

### Create a phone

#### `POST /api/phones`

Request:

```json
{
  "brand": "Google",
  "model": "Pixel 9",
  "price": 799,
  "specifications": {
    "display": "6.3-inch OLED",
    "processor": "Tensor G4",
    "RAM": "12GB",
    "storage": "128GB",
    "battery": "4700mAh",
    "camera": "50MP main",
    "operatingSystem": "Android 14"
  },
  "imageKey": "phoneshelf/server-generated-key.jpg"
}
```

Response `201`:

```json
{ "success": true, "data": { "_id": "mongodb-object-id", "brand": "Google" } }
```

Unknown fields are rejected. Duplicate brand/model records return `409`.

### Update a phone

#### `PATCH /api/phones/:id`

Request:

```json
{ "price": 749 }
```

Response `200`:

```json
{ "success": true, "data": { "_id": "mongodb-object-id", "price": 749 } }
```

### Delete a phone

#### `DELETE /api/phones/:id`

Response `200`:

```json
{
  "success": true,
  "data": { "message": "Phone deleted successfully." }
}
```

### Presign an image upload

#### `POST /api/uploads/presign`

Request:

```json
{
  "contentType": "image/jpeg",
  "contentLength": 120000
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "key": "phoneshelf/uuid.jpg",
    "uploadUrl": "https://signed-s3-url",
    "expiresIn": 900
  }
}
```

Supported types are JPEG, PNG, WebP, and GIF. The default maximum is 5 MB.

### Get a private image URL

#### `GET /api/uploads/url?key=phoneshelf/uuid.jpg`

Response `200`:

```json
{ "success": true, "data": { "url": "https://short-lived-signed-get-url" } }
```

Arbitrary S3 keys are rejected.

### Compare two phones

#### `POST /api/phones/compare`

Request:

```json
{
  "phoneAId": "mongodb-object-id",
  "phoneBId": "mongodb-object-id"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "summary": "Concise comparison.",
    "performance": {
      "analysis": "Database-backed analysis.",
      "winner": "phoneA"
    },
    "display": { "analysis": "Display differences.", "winner": "tie" },
    "battery": {
      "analysis": "Capacity is listed; battery life is uncertain.",
      "winner": "tie"
    },
    "camera": {
      "analysis": "Available camera data is compared without inferring quality from megapixels alone.",
      "winner": "phoneB"
    },
    "software": {
      "analysis": "Operating-system differences.",
      "winner": "phoneA"
    },
    "value": {
      "analysis": "Price and available features.",
      "winner": "phoneB"
    },
    "recommendations": {
      "gaming": "Recommendation with uncertainty.",
      "photography": "Recommendation with uncertainty.",
      "everydayUse": "Recommendation with uncertainty."
    },
    "finalRecommendation": "Which buyer should choose which phone.",
    "missingDataNotes": ["No chipset benchmark was supplied."]
  },
  "meta": { "cached": false }
}
```

The endpoint validates IDs, rejects identical IDs, fetches both records from MongoDB, and constructs the model prompt exclusively from those trusted records. Client-submitted specifications are never used. A cache hit returns the same shape with `meta.cached: true`.

The cache key is order-independent, includes the configured model and cache version, and includes each phone's `updatedAt`. Updating a price or specification changes the key and naturally invalidates the old comparison. The 24-hour TTL is a second freshness boundary.

Rate limits:

| Route category    |        Limit |
| ----------------- | -----------: |
| Phone reads       | 60/minute/IP |
| Phone writes      | 10/minute/IP |
| Upload presigning | 10/minute/IP |
| AI comparison     |  5/minute/IP |

AI provider failures return `502`, timeouts return `504`, invalid input returns `400`, missing phones return `404`, and rate exhaustion returns `429`.

## Manual verification checklist

- Start backend with all required variables.
- Start frontend and open `http://localhost:3000`.
- Create, list, edit, and delete two phones.
- Upload a valid image and verify it displays through a private signed GET URL.
- Reject a PDF, unsupported image type, and image larger than 5 MB.
- Verify arbitrary S3 keys are rejected.
- Select two different phones on `/compare`.
- Submit a comparison and inspect the structured categories and recommendations.
- Submit the same pair again and verify `meta.cached` is `true`.
- Edit a phone price/specification, compare again, and verify a new cache key is used.
- Submit identical IDs and malformed IDs.
- Test missing phone IDs.
- Exhaust the AI limit and verify `429`, `Retry-After`, and rate headers.
- Temporarily break OpenRouter credentials and verify a safe provider error.
- Temporarily make Redis unavailable and confirm rate-limit/cache behavior is reported separately.
- Confirm no `.env`, AWS key, Upstash token, or OpenRouter key is staged.

## Deployment

Deploy the backend as a separate Node service with the `backend/` directory as its working directory:

```bash
npm install
npm start
```

Set all backend environment variables in the hosting provider. Use an IAM role or secret manager for AWS credentials. Set `CLIENT_ORIGIN` to the exact deployed frontend origin and set `TRUST_PROXY` to the actual number of trusted reverse proxies.

Deploy the `frontend/` directory as a Next.js application:

```bash
npm install
npm run build
npm start
```

Set `NEXT_PUBLIC_API_URL` to the deployed Express URL. Update S3 CORS to the deployed frontend origin.

## Known limitations and future improvements

- There is no authentication or authorization. Anyone who can reach the API can modify the shared catalog within the configured rate limits.
- OpenRouter free routing can vary in availability and output quality. A pinned paid or verified structured-output model is more predictable.
- S3 orphan cleanup is best-effort plus lifecycle rules; a background reconciliation job would be stronger.
- AI comparisons are based only on catalog data and do not fetch independent reviews or benchmarks.
- Future improvements could add authentication, ownership, background comparison jobs, image metadata validation, stronger observability, and automated integration tests.

## Prompt 4 commit

```bash
git status
git add .
git status
git diff --cached
git commit -m "feat: add AI phone comparison and Redis caching"
git push origin main
```
