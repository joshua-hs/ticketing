import { TicketUpdatedEvent } from "@jhshtickets/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 200,
  });
  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "concert",
    price: 400,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const retrievedTicket = await Ticket.findById(ticket.id);

  expect(retrievedTicket).toBeDefined();
  expect(retrievedTicket!.title).toEqual(data.title);
  expect(retrievedTicket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it("does not ack message if the event has skipped versions", async () => {
  const { listener, data, message } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch (err) {}

  expect(message.ack).not.toHaveBeenCalled();
});
