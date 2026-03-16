import type { API } from '@discordjs/core';
import { GatewayDispatchEvents } from '@discordjs/core';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { messageCreateHandler } from '../messageCreate';
import { commands } from '../../commands/commandHandler';

vi.mock('../../commands/commandHandler', () => ({
    commands: { ping: vi.fn().mockResolvedValue({}) },
}));

function makeProps(overrides: { bot?: boolean; content?: string }) {
    const { bot = false, content = '' } = overrides;
    const api = {} as unknown as API;
    const data = {
        author: { bot, username: 'user', discriminator: '0000' },
        content,
        channel_id: 'chan-1',
        id: 'msg-1',
    } as unknown as GatewayMessageCreateDispatchData;
    return { api, data };
}

describe('messageCreateHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('has the correct event type', () => {
        expect(messageCreateHandler.event).toBe(GatewayDispatchEvents.MessageCreate);
    });

    it('calls commands.ping on !ping', async () => {
        const { api, data } = makeProps({ content: '!ping' });

        await messageCreateHandler.handler({ api, data });

        expect(commands.ping).toHaveBeenCalledWith({ api, data });
    });

    it('ignores messages from bots', async () => {
        const { api, data } = makeProps({ bot: true, content: '!ping' });

        await messageCreateHandler.handler({ api, data });

        expect(commands.ping).not.toHaveBeenCalled();
    });

    it('ignores non-ping messages', async () => {
        const { api, data } = makeProps({ content: 'hello world' });

        await messageCreateHandler.handler({ api, data });

        expect(commands.ping).not.toHaveBeenCalled();
    });
});
