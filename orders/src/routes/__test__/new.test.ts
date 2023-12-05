import { OrderStatus } from "@jhshtickets/common";
import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("Returns a 401 response if user is not signed in", async () => {
  const response = await request(app).post("/api/orders").send({});

  expect(response.status).toEqual(401);
});

it("Returns a status other than 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("Returns an error if the ticket does not exist", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: new mongoose.Types.ObjectId(),
    });

  expect(response.status).toEqual(404);
});

it("Returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Liszt concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: "testUserId",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("Correctly reserves the ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Liszt concert",
    price: 20,
  });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const { id } = response.body;

  const order = await Order.findById(id);

  expect(order).not.toBeNull();
});

it("Emits an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Liszt concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
