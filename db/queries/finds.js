import db from "#db/client";

//inserts a new mushroom find in the db
export async function createFind({
  userId,
  species,
  description,
  imageUrl,
  latitude,
  longitude,
  location,
  dateFound,
}) {
  const sql = `
    INSERT INTO finds
      (user_id, species, description, image_url, latitude, longitude, location, date_found)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [
    userId,
    species,
    description,
    imageUrl,
    latitude,
    longitude,
    location,
    dateFound,
  ];
  const {
    rows: [find],
  } = await db.query(sql, values); //run query + destructure a find
  return find; //sends back a inserted find
}
