# MycoMap Server (`mycomap-server`)

Backend REST API for MycoMap — a mushroom foraging and logging platform. This service powers authentication, persistence, and photo uploads for the MycoMap client.

This repository was previously named **BackendCapstone** and is now named **`mycomap-server`**.

## Highlights

- Secure auth with **JWT + bcrypt**
- **PostgreSQL** persistence (Supabase-compatible)
- Finds CRUD with **ownership enforcement**
- Photo uploads via **Multer** with **AWS S3** storage (and local-disk fallback for development)
- Public discovery endpoints that respect privacy controls (hidden locations are excluded or redacted)

## Tech Stack

- Node.js (ESM)
- Express
- PostgreSQL (`pg`)
- Auth: `jsonwebtoken`, `bcrypt`
- Uploads: `multer`, `multer-s3`
- Logging/CORS: `morgan`, `cors`

## Project Structure

- `server.js` — entry point (startup + env diagnostics)
- `app.js` — Express app configuration & middleware
- `api/` — route handlers (`finds.js`, `users.js`)
- `db/` — schema, seed, and query layer
- `middleware/` — auth, validation, error handling
- `utils/` — JWT helpers, S3 helpers, species utilities
- `scripts/` — maintenance utilities (e.g., image repair/migration)

## API Documentation

- Full endpoint reference: `API_DOCS.md`

Quick summary:

- Auth
  - `POST /users/register`
  - `POST /users/login`
- Finds
  - `GET /finds` — public finds (privacy-respecting)
  - `GET /finds/me` — current user finds (auth)
  - `GET /finds/:id` — single find for owner (auth)
  - `POST /finds` — create find (supports multipart `photo`)
  - `PUT /finds/:id` — update find (owner only, supports optional `photo`)
  - `DELETE /finds/:id` — delete find (owner only)
- Users
  - `GET /users?search=term`
  - `GET /users/:username/finds`

## Environment Variables

Create a `.env` file in the repo root (do not commit secrets).

### Required

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — signing secret for JWTs

### Optional / recommended

- `PORT` — defaults to `3000`

### S3 uploads (recommended for production)

- `S3_BUCKET` — bucket name (e.g. `mycomap-uploads`)
- `S3_REGION` — region (e.g. `us-east-2`)
- `S3_PUBLIC_BASE` — public base URL (no trailing slash), e.g. `https://mycomap-uploads.s3.us-east-2.amazonaws.com`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Notes:

- If S3 variables are missing, the server falls back to **local uploads** into `uploads/`.
- `S3_PUBLIC_BASE` is used to construct the public `image_url` saved in the database.

## Run Locally

```bash
npm install
npm run dev
```

By default the server runs on `http://localhost:3000`.

## Database setup

Schema and seed scripts are included:

```bash
# Apply schema to the local database named mycomapdb
npm run db:schema

# Seed the database (uses DATABASE_URL from .env)
npm run db:seed

# Reset schema + seed
npm run db:reset
```

Schema lives in `db/schema.sql`.

## Testing

This project includes a Jest test setup (see `test/` and the `npm test` script).

```bash
npm test
```

Notes:

- The test runner is configured for ESM and uses Node's `--experimental-vm-modules` flag (see `package.json`).
- If you’re running tests against a real database, ensure `DATABASE_URL` is set appropriately for your test environment.

## Image uploads

- Upload field name for multipart forms: `photo`
- The server stores the resulting **image URL** in `finds.image_url` (not the raw file)
- For S3, public access is controlled by bucket policy and CORS settings

### Repair/migration script

If you have legacy DB rows pointing to local `/uploads/...` paths, see `scripts/repair-images.js` to:

- Check whether the object already exists in S3
- Upload local files when available
- Update DB records to point at the correct S3 URL

## Deployment (Render + Supabase)

This service is compatible with Render and Supabase-hosted Postgres.

On Render, configure environment variables:

- `DATABASE_URL` (Supabase pooler URL recommended)
- `JWT_SECRET`
- (If using S3) `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_BASE`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## Security considerations

- Passwords are hashed with bcrypt.
- JWTs are validated via `Authorization: Bearer <token>`.
- Write routes enforce ownership (users can only modify their own finds).
- Keep database credentials and AWS keys out of source control.

## Troubleshooting

- **Uploads saving locally instead of S3:** confirm S3 env vars are set (especially `S3_BUCKET` and AWS credentials).
- **`S3_PUBLIC_BASE` is `undefined`:** set `S3_PUBLIC_BASE` in your environment; otherwise image URLs may be incorrect.
- **S3 CORS:** ensure the bucket allows your Netlify origin(s). Example configs exist in `cors.json` and `cors-console.json`.

---

Maintainer: MajerAsh
