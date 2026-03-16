import type { API } from '@discordjs/core';
import { GatewayDispatchEvents } from '@discordjs/core';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import { describe, expect, it, vi } from 'vitest';
import { messageCreateHandler } from '../messageCreate';

function makeProps(overrides: {
    bot?: boolean;
    content?: string;
    channelId?: string;
    messageId?: string;
}) {
    const { bot = false, content = '', channelId = 'chan-1', messageId = 'msg-1' } = overrides;
    const createMessage = vi.fn().mockResolvedValue({});
    const api = { channels: { createMessage } } as unknown as API;
    const data = {
        author: { bot },
        content,
        channel_id: channelId,
        id: messageId,
    } as unknown as GatewayMessageCreateDispatchData;
    return { api, data, createMessage };
}

describe('messageCreateHandler', () => {
    it('has the correct event type', () => {
        expect(messageCreateHandler.event).toBe(GatewayDispatchEvents.MessageCreate);
    });

    it('replies with pong on !ping', async () => {
        const { api, data, createMessage } = makeProps({
            content: '!ping',
            channelId: 'chan-1',
            messageId: 'msg-1',
        });

        await messageCreateHandler.handler({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'pong!',
            message_reference: { message_id: 'msg-1' },
        });
    });

    it('ignores messages from bots', async () => {
        const { api, data, createMessage } = makeProps({ bot: true, content: '!ping' });

        await messageCreateHandler.handler({ api, data });

        expect(createMessage).not.toHaveBeenCalled();
    });

    it('ignores non-ping messages', async () => {
        const { api, data, createMessage } = makeProps({ content: 'hello world' });

        await messageCreateHandler.handler({ api, data });

        expect(createMessage).not.toHaveBeenCalled();
    });
});
