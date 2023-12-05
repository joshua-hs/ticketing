import { OrderCancelledEvent, Publisher, Subjects } from "@jhshtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
