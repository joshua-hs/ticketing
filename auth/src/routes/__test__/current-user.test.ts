import request from "supertest";
import { app } from "../../app";

it("responds with details about current user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(400);

  console.log(response.body);

  expect(response.body.currentUser.email).toMatch("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeNull;
});
