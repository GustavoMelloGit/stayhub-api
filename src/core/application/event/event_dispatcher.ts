import type { DomainEvent } from "../../domain/event/domain_event";
import type { EventHandler } from "./event_handler";

export interface EventDispatcher {
  register(event_name: string, handler: EventHandler<DomainEvent>): void;
  dispatch(event: DomainEvent): Promise<void>;
}
