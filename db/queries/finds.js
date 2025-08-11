import db from "#db/client";

// all finds + username for map/popups
export async function getAllFinds() {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      u.username
    FROM finds f
    JOIN users u ON u.id = f.user_id
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql);
  return rows;
}

export async function getFindsByUserId(user_id) {
  const sql = `
  SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      u.username
    FROM finds f
    JOIN users u ON u.id = f.user_id
    WHERE f.user_id = $1
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql, [user_id]);
  return rows;
}

//8/8/25:current user's finds
export async function getMyFinds(user_id) {
  return getFindsByUserId(user_id);
}

//Cr8s a new Find in the db and return the newly cr8ed record
export async function createFind({
  user_id,
  species,
  description,
  image_url,
  latitude,
  longitude,
  location,
  date_found,
}) {
  const sql = `
    INSERT INTO finds
      (user_id, species, description, image_url, latitude, longitude, location, date_found)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
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
  ];
  const {
    rows: [find],
  } = await db.query(sql, values); //run query + destructure a find
  return find; //sends back a inserted find
}
//updates a find entry with given fields by id and user_id.
export async function updateFind(id, user_id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;

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

//deletes a specific find by id and user_id (auth check)
export async function deleteFind(id, user_id) {
  const sql = `DELETE FROM finds WHERE id = $1 AND user_id = $2`; //only the owner can delete their find
  await db.query(sql, [id, user_id]);
}

//for find foragers:
export async function getFindsByUsername(username) {
  const sql = `
    SELECT
      f.id, f.user_id, f.species, f.description, f.image_url,
      f.latitude, f.longitude, f.location,
      to_char(f.date_found, 'YYYY-MM-DD') AS date_found,
      u.username
    FROM finds f
    JOIN users u ON u.id = f.user_id
    WHERE u.username = $1
    ORDER BY f.date_found DESC
  `;
  const { rows } = await db.query(sql, [username]);
  return rows;
}
