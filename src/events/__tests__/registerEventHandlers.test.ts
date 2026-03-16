import type { Client } from '@discordjs/core';
import { GatewayDispatchEvents } from '@discordjs/core';
import { describe, expect, it, vi } from 'vitest';
import { registerEventHandlers } from '../eventHandler';
import type { EventHandler } from '../eventHandler';

function makeClient(): { on: ReturnType<typeof vi.fn>; client: Client } {
    const on = vi.fn();
    return { on, client: { on } as unknown as Client };
}

describe('registerEventHandlers', () => {
    it('calls client.on with the correct event and handler', () => {
        const { on, client } = makeClient();
        const handler = vi.fn();
        const eventHandler: EventHandler = {
            event: GatewayDispatchEvents.MessageCreate,
            handler,
        };

        registerEventHandlers(client, [eventHandler]);

        expect(on).toHaveBeenCalledOnce();
        expect(on).toHaveBeenCalledWith(GatewayDispatchEvents.MessageCreate, handler);
    });

    it('registers multiple handlers', () => {
        const { on, client } = makeClient();
        const messageHandler = vi.fn();
        const readyHandler = vi.fn();

        registerEventHandlers(client, [
            { event: GatewayDispatchEvents.MessageCreate, handler: messageHandler },
            { event: GatewayDispatchEvents.Ready, handler: readyHandler },
        ]);

        expect(on).toHaveBeenCalledTimes(2);
        expect(on).toHaveBeenCalledWith(GatewayDispatchEvents.MessageCreate, messageHandler);
        expect(on).toHaveBeenCalledWith(GatewayDispatchEvents.Ready, readyHandler);
    });

    it('does nothing with an empty array', () => {
        const { on, client } = makeClient();

        registerEventHandlers(client, []);

        expect(on).not.toHaveBeenCalled();
    });
});
