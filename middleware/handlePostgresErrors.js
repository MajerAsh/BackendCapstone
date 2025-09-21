// Common PG error codes:
// 22P02  invalid_text_representation (bad type cast/NaN)
// 22001  string_data_right_truncation
// 23502  not_null_violation
// 23503  foreign_key_violation
// 23505  unique_violation
const CODES = {
  INVALID_TYPE: "22P02",
  STRING_TRUNC: "22001",
  NOT_NULL: "23502",
  FOREIGN_KEY: "23503",
  UNIQUE: "23505",
};

export default function handlePostgresErrors(err, req, res, next) {
  switch (err?.code) {
    case CODES.INVALID_TYPE:
      //like passing a letter when number is expected
      return res
        .status(400)
        .json({ error: "Invalid value for one or more fields." });

    case CODES.STRING_TRUNC:
      return res
        .status(400)
        .json({ error: "One or more fields are too long." });

    case CODES.NOT_NULL:
      // err.column is usually present
      return res
        .status(400)
        .json({ error: `Missing required field: ${err.column || "unknown"}.` });

    case CODES.FOREIGN_KEY:
      return res.status(400).json({ error: "Related record not found." });

    case CODES.UNIQUE:
      // err.detail is abbrasive
      return res.status(409).json({ error: "User already exists" });

    default:
      return next(err);
  }
}
