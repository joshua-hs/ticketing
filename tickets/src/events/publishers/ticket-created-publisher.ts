import { Publisher, Subjects, TicketCreatedEvent } from "@jhshtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
