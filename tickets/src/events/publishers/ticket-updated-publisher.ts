import { Publisher, Subjects, TicketUpdatedEvent } from "@jhshtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
