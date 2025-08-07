import db from "#db/client.js";

// fetchs all Finds from the db, sorted by most recent found_date
//  result returns as an array of Finds
export async function getAllFinds() {
  const sql = `SELECT * FROM finds ORDER BY found_date DESC`;
  const { rows } = await db.query(sql);
  return rows;
}

//fetches all Finds created by single user, sorted by found_date
export async function getFindsByUserId(user_id) {
  const sql = `SELECT * FROM finds WHERE user_id = $1 ORDER BY found_date DESC`;
  const { rows } = await db.query(sql, [user_id]);
  return rows;
}

//Cr8s a new Find in the db and return the newly cr8ed record
export async function createFind({
  user_id,
  species,
  description,
  image_url,
  found_date,
  location_json,
}) {
  const sql = `
    INSERT INTO finds (user_id, species, description, image_url, found_date, location_json)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`; //inserts data and returns the inserted row
  const values = [
    user_id,
    species,
    description,
    image_url,
    found_date,
    location_json,
  ];
  const {
    rows: [find],
  } = await db.query(sql, values);
  return find;
}

//updates a find entry with given fields (ie species, description) by its id and user_id
export async function updateFind(id, user_id, fields) {
  const keys = Object.keys(fields); // Get field names to update
  const updates = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", "); //builds the dynamic SQL update string like, "species = $1, description = $2"
  const values = [...Object.values(fields), id, user_id];

  const sql = `UPDATE finds SET ${updates} WHERE id = $${
    // SQL to update a specific find only if user_id matches
    values.length - 1
  } AND user_id = $${values.length} RETURNING *`;
  const {
    rows: [updated],
  } = await db.query(sql, values); // Execute and get the updated row
  return updated;
}

//deletes a specific find by id and user_id (auth check)
export async function deleteFind(id, user_id) {
  const sql = `DELETE FROM finds WHERE id = $1 AND user_id = $2`; //only the owner can delete their find
  await db.query(sql, [id, user_id]);
}
