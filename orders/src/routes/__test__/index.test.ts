import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it("returns an empty object if user is not authenticated", async () => {
  await request(app).get("/api/orders").expect(401);
});

it("correctly returns orders when authenticated", async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const cookieUserOne = global.signin();
  const cookieUserTwo = global.signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookieUserOne)
    .send({ ticketId: ticketOne.id });

  const { body: OrderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookieUserTwo)
    .send({ ticketId: ticketTwo.id });

  const { body: OrderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookieUserTwo)
    .send({ ticketId: ticketThree.id });

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookieUserTwo)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(OrderOne.id);
  expect(response.body[1].id).toEqual(OrderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
