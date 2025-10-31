# BackendCapstone API Documentation

## Overview

This document describes the main API endpoints for the BackendCapstone project. All endpoints return JSON unless otherwise noted.

---

## Authentication

### POST /users/register

- **Description:** Register a new user.
- **Body:** `{ username: string, password: string }`
- **Returns:** JWT token (string)
- **Errors:** 409 if username exists, 400 for missing fields

### POST /users/login

- **Description:** Log in a user.
- **Body:** `{ username: string, password: string }`
- **Returns:** JWT token (string)
- **Errors:** 401 for invalid credentials, 400 for missing fields

---

## Users

### GET /users?search=term

- **Description:** Search users by username (partial match).
- **Query:** `search` (string)
- **Returns:** Array of user objects

### GET /users/:username/finds

- **Description:** Get public finds for a user.
- **Returns:** Array of find objects (location hidden if secret)

---

## Finds

### GET /finds

- **Description:** Get all public finds.
- **Returns:** Array of find objects

### GET /finds/me

- **Description:** Get all finds for the authenticated user.
- **Auth:** Bearer token required
- **Returns:** Array of find objects

### GET /finds/:id

- **Description:** Get a specific find for the authenticated user.
- **Auth:** Bearer token required
- **Returns:** Find object
- **Errors:** 404 if not found

### POST /finds

- **Description:** Create a new find.
- **Auth:** Bearer token required
- **Body:** `species`, `date_found` (required), plus optional fields
- **File:** `photo` (multipart/form-data)
- **Returns:** Created find object
- **Errors:** 400 for missing/invalid fields

### PUT /finds/:id

- **Description:** Update a find (owner only).
- **Auth:** Bearer token required
- **Body:** Any updatable fields
- **File:** `photo` (optional)
- **Returns:** Updated find object
- **Errors:** 404 if not found

### DELETE /finds/:id

- **Description:** Delete a find (owner only).
- **Auth:** Bearer token required
- **Returns:** `{ message: "Find deleted" }`

---

## Error Codes

- 400: Bad request (missing/invalid fields)
- 401: Unauthorized
- 404: Not found
- 409: Conflict (e.g., duplicate username)

---

## Notes

- All endpoints may return additional error messages for database or server errors.
- For protected routes, include `Authorization: Bearer <token>` header.
- File uploads use `multipart/form-data`.

---

For more details, see the source code or contact the project maintainer.

FE to BE API calls hosted by render "https://mycomap-backend.onrender.com"
