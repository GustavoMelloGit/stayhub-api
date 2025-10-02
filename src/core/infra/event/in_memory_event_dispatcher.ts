// src/core/infra/event/in-memory-event-dispatcher.ts

import type { EventDispatcher } from "../../application/event/event_dispatcher";
import type { EventHandler } from "../../application/event/event_handler";
import type { DomainEvent } from "../../domain/event/domain_event";

export class InMemoryEventDispatcher implements EventDispatcher {
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  register(eventName: string, handler: EventHandler<DomainEvent>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventName = event.name;
    const handlers = this.handlers.get(eventName);

    if (handlers) {
      console.log(
        `Dispatching event ${eventName} to ${handlers.length} handler(s).`,
      );
      await Promise.all(handlers.map((handler) => handler.handle(event)));
    }
  }
}
