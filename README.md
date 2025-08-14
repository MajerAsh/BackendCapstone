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
