import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@jhshtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Common setup
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "concert",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("creates and saves a ticket", async () => {
  const { listener, data, message } = await setup();
  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, message);
  // Write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();
  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, message);
  // Write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});
