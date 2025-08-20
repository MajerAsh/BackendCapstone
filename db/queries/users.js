import db from "#db/client";
import bcrypt from "bcrypt";

/*create a new user: hashes the text password before storing,
  returns the full user row as currently written (includes password hash):*/
export async function createUser(username, password) {
  const sql = `
  INSERT INTO users
    (username, password)
  VALUES
    ($1, $2)
  RETURNING *
  `;

  //compares normal- text password to bcrypt hash:
  const hashedPassword = await bcrypt.hash(password, 10);

  //"parameterized" query prevents SQL injection
  const {
    rows: [user],
  } = await db.query(sql, [username, hashedPassword]);
  return user;
}

//get user by username: uses bcrypt.compare to compare hash to text, returns user on success
export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  //compares normal- text password to bcrypt hash:
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}

//query for find foragers cmponent: search by username using ILIKE and a contains pattern
//🤖
export async function searchUsersByUsername(term) {
  const sql = `
      SELECT
      u.id, u.username, u.city, u.state,
      COALESCE(ds.distinct_species, 0) AS distinct_species,
      CASE
        WHEN COALESCE(ds.distinct_species,0) >= 25 THEN 'Myco Master'
        WHEN COALESCE(ds.distinct_species,0) >= 10 THEN 'Seasoned Forager'
        WHEN COALESCE(ds.distinct_species,0) >= 5  THEN 'Fruiting'
       ELSE NULL
      END AS badge
     FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(DISTINCT LOWER(TRIM(species))) AS distinct_species
      FROM finds
      GROUP BY user_id
    ) ds ON ds.user_id = u.id
    WHERE username ILIKE '%' || $1 || '%' 
    ORDER BY username ASC
  `;
  //"parameterized"; the '%' concat happens in SQL, input stays a single param
  const { rows } = await db.query(sql, [term]);
  return rows;
}
//substring search: WHERE username ILIKE '%' || $1 || '%' 🤖
