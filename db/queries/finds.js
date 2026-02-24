import db from "#db/client";

// Public map: exclude secret finds entirely (26)
export async function getAllFinds() {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      f.hide_location,
      u.username,
      COALESCE(ds.distinct_species, 0) AS distinct_species,
      CASE
        WHEN COALESCE(ds.distinct_species,0) >= 25 THEN 'Myco Master'
        WHEN COALESCE(ds.distinct_species,0) >= 10 THEN 'Seasoned Forager'
        WHEN COALESCE(ds.distinct_species,0) >= 5  THEN 'Fruiting'
        ELSE NULL
      END AS badge
    FROM finds f
    JOIN users u ON u.id = f.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(DISTINCT LOWER(TRIM(species))) AS distinct_species
      FROM finds
      GROUP BY user_id
    ) ds ON ds.user_id = f.user_id
    WHERE f.hide_location = false
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// Owner views (My Finds): return everything
export async function getFindsByUserId(user_id) {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      f.hide_location,
      u.username,
      COALESCE(ds.distinct_species, 0) AS distinct_species,
      CASE
        WHEN COALESCE(ds.distinct_species,0) >= 25 THEN 'Myco Master'
        WHEN COALESCE(ds.distinct_species,0) >= 10 THEN 'Seasoned Forager'
        WHEN COALESCE(ds.distinct_species,0) >= 5  THEN 'Fruiting'
        ELSE NULL
      END AS badge
    FROM finds f
    JOIN users u ON u.id = f.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(DISTINCT LOWER(TRIM(species))) AS distinct_species
      FROM finds
      GROUP BY user_id
    ) ds ON ds.user_id = f.user_id
    WHERE f.user_id = $1
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql, [user_id]);
  return rows;
}

//current user's finds
export async function getMyFinds(user_id) {
  return getFindsByUserId(user_id);
}

// get one find for a given user (for edit/view)
export async function getFindByIdForUser(id, user_id) {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      f.hide_location,
      u.username
    FROM finds f
    JOIN users u ON u.id = f.user_id
    WHERE f.id = $1 AND f.user_id = $2
  `;
  const {
    rows: [row],
  } = await db.query(sql, [id, user_id]);
  return row || null;
}

//makes a new Find in the db and return the newly created record
export async function createFind({
  user_id,
  species,
  description,
  image_url,
  latitude,
  longitude,
  location,
  date_found,
  hide_location = false,
}) {
  const sql = `
        INSERT INTO finds
      (user_id, species, description, image_url, latitude, longitude, location, date_found, hide_location)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)

    RETURNING *
  `;
  const values = [
    user_id,
    species,
    description,
    image_url,
    latitude,
    longitude,
    location,
    date_found,
    hide_location,
  ];
  const {
    rows: [find],
  } = await db.query(sql, values); //run query + destructure a find
  return find;
}
//update a find entry (owner/id only)
export async function updateFind(id, user_id, fields) {
  const allowed = new Set([
    "species",
    "description",
    "image_url",
    "latitude",
    "longitude",
    "location",
    "date_found",
    "hide_location",
  ]);

  const keys = Object.keys(fields).filter((k) => allowed.has(k));
  if (keys.length === 0) return null;

  // If the caller attempted to update any disallowed fields, treat as an error.
  // This avoids silently ignoring unexpected input.
  const rejected = Object.keys(fields).filter((k) => !allowed.has(k));
  if (rejected.length) {
    throw new Error(`Invalid update fields: ${rejected.join(", ")}`);
  }

  const setSql = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = [...Object.values(fields), id, user_id];

  const sql = `
    UPDATE finds
    SET ${setSql}
    WHERE id = $${values.length - 1} AND user_id = $${values.length}
    RETURNING *
  `;
  const {
    rows: [updated],
  } = await db.query(sql, values);
  return updated;
}

//delete a specific find (owner only)
export async function deleteFind(id, user_id) {
  const sql = `DELETE FROM finds WHERE id = $1 AND user_id = $2`; //only the owner can delete their find
  await db.query(sql, [id, user_id]);
}

// Public profile page: never leak location/coords if hidden
export async function getFindsByUsername(username) {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      CASE WHEN f.hide_location THEN NULL ELSE f.latitude  END AS latitude,
      CASE WHEN f.hide_location THEN NULL ELSE f.longitude END AS longitude,
      CASE WHEN f.hide_location THEN NULL ELSE f.location  END AS location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      f.hide_location,
      u.username,
      COALESCE(ds.distinct_species, 0) AS distinct_species,
      CASE
        WHEN COALESCE(ds.distinct_species,0) >= 25 THEN 'Myco Master'
        WHEN COALESCE(ds.distinct_species,0) >= 10 THEN 'Seasoned Forager'
        WHEN COALESCE(ds.distinct_species,0) >= 5  THEN 'Fruiting'
        ELSE NULL
      END AS badge
    FROM finds f
    JOIN users u ON u.id = f.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(DISTINCT LOWER(TRIM(species))) AS distinct_species
      FROM finds
      GROUP BY user_id
    ) ds ON ds.user_id = f.user_id
    WHERE u.username = $1
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql, [username]);
  return rows;
}
