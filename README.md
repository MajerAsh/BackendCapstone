# MycoMap — Backend (BackendCapstone)

> REST API and upload service for MycoMap. Handles authentication, PostgreSQL persistence, and image uploads (S3 or local fallback).

## Overview

This service provides the server-side functionality for MycoMap: user auth (JWT), CRUD for mushroom "finds", and file uploads. It was developed as the Backend Capstone and is intentionally small and focused.

Key features

- JWT authentication (login/register)
- PostgreSQL persistence (queries in `db/queries`)
- Image uploads to AWS S3 (AWS SDK v3) with a local-disk fallback for development
- Repair script to migrate local uploads to S3: `scripts/repair-images.js`

## Repo layout (important files)

- `app.js` — Express app & middleware
- `server.js` — server entry; prints key env vars at startup
- `api/` — API route handlers (e.g., `finds.js`, `users.js`)
- `db/` — database client, schema, seeds and queries
- `utils/s3Client.js` — S3 client + multer integration, local fallback
- `scripts/repair-images.js` — automated migration for legacy `/uploads/` rows
- `public_images/`, `uploads/` — local storage locations (dev fallback)

## Prerequisites

- Node.js (>= 18 recommended)
- npm
- PostgreSQL (or a hosted Postgres such as Supabase)
- (Optional) AWS account and S3 bucket for production image storage

## Environment variables

Create a `.env` file at the root of `BackendCapstone/` (do NOT commit secrets). The server expects the following keys at minimum for production S3 usage:

- `DATABASE_URL` — Postgres connection (e.g. `postgresql://user:pass@host:port/dbname`)
- `JWT_SECRET` — secret used to sign JWTs
- `PORT` — server port (defaults to `3000`)
- `S3_BUCKET` — S3 bucket name (e.g. `mycomap-uploads`)
- `S3_REGION` — S3 region (e.g. `us-east-2`)
- `S3_PUBLIC_BASE` — public base URL for objects (no trailing slash), e.g. `https://mycomap-uploads.s3.us-east-2.amazonaws.com`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — AWS credentials that can upload to the bucket

Notes:

- If S3 env vars are missing the server falls back to saving files locally in the `uploads/` directory. The server prints `S3 credentials or bucket not found in environment; falling back to local disk uploads (uploads/).` on startup.
- `S3_PUBLIC_BASE` must be set so the server can construct public image URLs. If you see `S3_PUBLIC_BASE: undefined` in logs, the variable is missing.
- Avoid setting `acl` on uploads if your bucket's Object Ownership is "Bucket owner enforced" — uploads should omit ACL and use a bucket policy granting read access.

## Install and run (local)

From `BackendCapstone/`:

```bash
npm install
cp .env.example .env   # or create .env with the vars above
npm run dev            # or `node server.js` for production mode
```

When starting, `server.js` prints diagnostics for `DATABASE_URL` and `S3_PUBLIC_BASE` to help ensure env vars are visible.

## Database

- The SQL schema is in `db/schema.sql` and a small seed is available at `db/seed.js`.
- The DB client is in `db/client.js` (uses `import "dotenv/config"` to load env vars).

## Useful scripts

- `scripts/repair-images.js` — migration script to scan finds rows referencing `/uploads/`, head-check S3, optionally upload local files to S3 and update DB rows. Run with `node scripts/repair-images.js` after setting `DATABASE_URL` and AWS env vars locally. Review the script and test in dry-run mode if necessary.

## API Endpoints (summary)

- `POST /api/users/register` — register new user
- `POST /api/users/login` — login (returns `{ token }`)
- `GET /api/finds` — public finds (no hidden locations)
- `GET /api/finds/me` — finds for current user (auth)
- `POST /api/finds` — create a find (multipart upload `photo` field supported)
- `PUT /api/finds/:id` — update find (owner only)
- `DELETE /api/finds/:id` — delete find (owner only)

Refer to `api/finds.js` and `api/users.js` for route details and payload formats.

## CORS & S3 Bucket Policy

- S3 CORS must be configured to allow your frontend origin(s). There are two config examples in the repo: `cors.json` (CLI format) and `cors-console.json` (Console array format).
- Use `bucket-policy.json` as a minimal public read policy for objects (if you want object URLs to be publicly readable). Adjust as needed for security.

## Common troubleshooting

- `S3_PUBLIC_BASE: undefined` — set `S3_PUBLIC_BASE` in `.env` or on your host (Render, Netlify functions, etc.).
- `AccessControlListNotSupported` — remove `acl` from uploads; use bucket policy and Object Ownership set to "Bucket owner enforced".
- Preflight (OPTIONS) 503 — if using Cloudflare/workers, ensure they forward OPTIONS to your backend or allow CORS preflight responses.

## Testing

- The repo includes tests under `test/` and uses Jest/Vitest depending on config. Run `npm test` to run server tests if present.

## Deployment notes (Render example)

- Ensure Render (or your host) environment variables include `DATABASE_URL`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_BASE`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `JWT_SECRET`.
- Restart the service after setting env vars.

## Security

- Keep `JWT_SECRET` and AWS credentials out of source control.
- Consider migrating to presigned uploads for clients to upload directly to S3 and only store keys/urls in the DB.

## Contributing

Contributions are welcome. Please open issues or PRs. Keep changes focused and include tests where applicable.

---

Created for the Backend Capstone project.

**[Backend Repository](https://github.com/MajerAsh/BackendCapstone)**
MycoMap BackendCapstone

This is the backend repository for MycoMap, a mushroom foraging platform. It provides a RESTful API using Express and PostgreSQL database schema for authentication and mushroom find logging.
The frontend lives in the FrontendCapstone repository.

--------- Features:

-RESTful API with:
User registration and login
JWT-based authentication
CRUD routes for mushroom finds

-PostgreSQL database with users and finds tables

-Middleware for:
Request body validation
Auth token verification
Postgres error handling

-Image upload with Multer (local storage)

--------- Technologies:

-Express.js (v5)

-PostgreSQL

-pg (node-postgres)

-bcrypt (hashing passwords)

-jsonwebtoken (JWT auth)

-Multer (image upload)

-CORS & Morgan
