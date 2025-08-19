DROP TABLE IF EXISTS finds;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text,
  city text,
  state text
);

CREATE TABLE finds (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  species text,
  description text,
  image_url text,
  latitude float,
  longitude float,
  location text,
  date_found date NOT NULL,
  hide_location boolean NOT NULL DEFAULT false
);