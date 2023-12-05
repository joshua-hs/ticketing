import { PaymentCreatedEvent, Publisher, Subjects } from "@jhshtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
