import { OrderCreatedEvent, Publisher, Subjects } from "@jhshtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
