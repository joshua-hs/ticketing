import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@jhshtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    userId: "test",
    status: OrderStatus.Created,
  });
  await order.save();

  const orderCancelledData: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "test",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, orderCancelledData, msg };
};

it("sets the status of an order to order:cancelled", async () => {
  const { listener, orderCancelledData, msg } = await setup();

  await listener.onMessage(orderCancelledData, msg);

  const order = await Order.findById(orderCancelledData.id);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, orderCancelledData, msg } = await setup();

  await listener.onMessage(orderCancelledData, msg);

  expect(msg.ack).toHaveBeenCalled();
});
