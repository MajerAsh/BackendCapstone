// API smoke + validation tests

import request from "supertest";
import { app } from "../server.js";

describe("API Health Check", () => {
  it("should return 200 for /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /finds validation", () => {
  let token;
  beforeAll(async () => {
    // Register and login a user to get a JWT
    const username = `testuser_${Date.now()}`;
    const password = "Testpass123!";
    await request(app).post("/users/register").send({ username, password });
    const res = await request(app)
      .post("/users/login")
      .send({ username, password });
    token = res.body.token;
  });

  it("should reject invalid date_found", async () => {
    const res = await request(app)
      .post("/finds")
      .set("Authorization", `Bearer ${token}`)
      .field("species", "Agaricus")
      .field("date_found", "not-a-date");
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("should create a find with valid data", async () => {
    const res = await request(app)
      .post("/finds")
      .set("Authorization", `Bearer ${token}`)
      .field("species", "Agaricus")
      .field("date_found", "2025-09-17");
    expect(res.statusCode).toBe(201);
    expect(res.body.species).toBe("Agaricus");
  });
});

describe("PUT /finds/:id validation", () => {
  let token, findId;
  beforeAll(async () => {
    const username = `testuser2_${Date.now()}`;
    const password = "Testpass123!";
    await request(app).post("/users/register").send({ username, password });
    const res = await request(app)
      .post("/users/login")
      .send({ username, password });
    token = res.body.token;
    // Create a find to update
    const findRes = await request(app)
      .post("/finds")
      .set("Authorization", `Bearer ${token}`)
      .field("species", "Boletus")
      .field("date_found", "2025-09-17");
    findId = findRes.body.id;
  });

  it("should reject invalid latitude", async () => {
    const res = await request(app)
      .put(`/finds/${findId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ latitude: 999 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("should update with valid data", async () => {
    const res = await request(app)
      .put(`/finds/${findId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated desc" });
    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe("Updated desc");
  });
});
