import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

//creates a token with the given payload
export function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

//extracts the payload from a token
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
