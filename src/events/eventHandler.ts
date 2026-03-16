import type { API, Client, MappedEvents } from '@discordjs/core';

export type EventProps<Data> = {
    api: API;
    data: Data;
};

type EventData<K extends keyof MappedEvents> = MappedEvents[K][0]['data'];

export type EventHandler = {
    event: keyof MappedEvents;
    handler: (props: EventProps<unknown>) => void | Promise<void>;
};

export function createEventHandler<K extends keyof MappedEvents>(
    event: K,
    handler: (props: EventProps<EventData<K>>) => void | Promise<void>,
): EventHandler {
    return { event, handler } as EventHandler;
}

export function registerEventHandlers(client: Client, handlers: EventHandler[]): void {
    for (const handler of handlers) {
        client.on(
            handler.event,
            handler.handler as (props: EventProps<unknown>) => void | Promise<void>,
        );
    }
}
