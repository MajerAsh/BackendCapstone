# MycoMap Backend

REST API for MycoMap, a mushroom foraging and logging platform.  
This service handles authentication, persistence, and image uploads.

The backend is built as a standalone API and is designed to be consumed by a web frontend or other clients.

---

## Overview

The MycoMap backend provides:

- JWT-based user authentication
- CRUD operations for mushroom finds
- PostgreSQL persistence
- Image uploads to AWS S3 (with a local disk fallback for development)
- Privacy controls for sensitive location data

The API enforces ownership rules so users can only modify their own data, while still supporting public discovery features.

---

## Tech Stack

- Node.js
- Express
- PostgreSQL
- pg (node-postgres)
- JWT (jsonwebtoken)
- bcrypt
- Multer (file uploads)
- AWS S3
- CORS & Morgan

---

## Project Structure

api/ Route handlers
db/ Database client, schema, queries, seeds
middleware/ Auth, validation, and error handling
utils/ JWT, S3 helpers, species utilities
server.js Server entry point
app.js Express app configuration

## Authentication

Authentication is handled using signed JWTs.

- Tokens are issued on login and registration
- Tokens are passed via the `Authorization: Bearer <token>` header
- Protected routes require a valid token

---

## API Endpoints (Summary)

### Auth

- `POST /users/register`
- `POST /users/login`

### Finds

- `GET /finds` — public finds (hidden locations excluded)
- `GET /finds/me` — authenticated user’s finds
- `POST /finds` — create a find
- `PUT /finds/:id` — update a find (owner only)
- `DELETE /finds/:id` — delete a find (owner only)

### Users

- `GET /users?search=term` — username search
- `GET /users/:username/finds` — public finds for a user

Refer to `API_DOCS.md` for full request and response details.

---

## Database

The database uses PostgreSQL with a simple relational schema:

- `users` — authentication and profile data
- `finds` — logged mushroom finds, including optional location and image data

Schema definitions are located in `db/schema.sql`.

---

## Image Uploads

- Images are uploaded using Multer
- In production, uploads are stored in AWS S3
- Public image access is controlled via bucket policy
- In development, files can be stored locally as a fallback

The backend stores image URLs (or keys) in the database, not raw files.

---

## Environment Variables

The backend expects the following environment variables:

DATABASE_URL
JWT_SECRET
PORT
S3_BUCKET
S3_REGION
S3_PUBLIC_BASE
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

---

## Running Locally

```bash
npm install
npm run dev
The server will start on the configured port (default: 3000).

Notes on Security
Passwords are hashed with bcrypt

JWT secrets and credentials are read from environment variables

Location data can be marked as private and is excluded from public responses

Ownership is enforced on all write operations

```
