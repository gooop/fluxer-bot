import type { API } from '@discordjs/core';
import { GatewayDispatchEvents } from '@discordjs/core';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { messageCreateHandler } from '../messageCreate';
import { commands } from '../../commands/commandHandler';

vi.mock('../../commands/commandHandler', () => ({
    commands: {
        ping: vi.fn().mockResolvedValue({}),
        default: vi.fn().mockResolvedValue({}),
        quote: vi.fn().mockResolvedValue({}),
    },
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

    it.each(['!rc ping', '!rc PING', '!rc Ping', '!rc pInG'])(
        'calls commands.ping for: %s',
        async (content) => {
            const { api, data } = makeProps({ content });

            await messageCreateHandler.handler({ api, data });

            expect(commands.ping).toHaveBeenCalledWith({ api, data });
        },
    );

    it.each(['!rc quote', '!rc QUOTE', '!rc Quote'])(
        'calls commands.quote for: %s',
        async (content) => {
            const { api, data } = makeProps({ content });

            await messageCreateHandler.handler({ api, data });

            expect(commands.quote).toHaveBeenCalledWith({ api, data });
        },
    );

    it('ignores messages from bots', async () => {
        const { api, data } = makeProps({ bot: true, content: '!rc ping' });

        await messageCreateHandler.handler({ api, data });

        expect(commands.ping).not.toHaveBeenCalled();
    });

    it('ignores non-ping messages', async () => {
        const { api, data } = makeProps({ content: 'hello world' });

        await messageCreateHandler.handler({ api, data });

        expect(commands.ping).not.toHaveBeenCalled();
    });

    it.each(['!rc', '!rc fhsdfsdha', '!rc notACommand', '!rc 🚀', '!rc ping 🎉 extra'])(
        'calls commands.default for unrecognised input: %s',
        async (content) => {
            const { api, data } = makeProps({ content });

            await messageCreateHandler.handler({ api, data });

            expect(commands.default).toHaveBeenCalledWith({ api, data });
        },
    );
});

describe('messageCreateHandler error handling', () => {
    it('does not throw when commands.quote rejects', async () => {
        vi.mocked(commands.quote).mockRejectedValueOnce(new Error('discord api down'));
        const { api, data } = makeProps({ content: '!rc quote' });

        await expect(messageCreateHandler.handler({ api, data })).resolves.not.toThrow();
    });

    it('does not throw when commands.ping rejects', async () => {
        vi.mocked(commands.ping).mockRejectedValueOnce(new Error('discord api down'));
        const { api, data } = makeProps({ content: '!rc ping' });

        await expect(messageCreateHandler.handler({ api, data })).resolves.not.toThrow();
    });

    it('does not throw when commands.default rejects', async () => {
        vi.mocked(commands.default).mockRejectedValueOnce(new Error('discord api down'));
        const { api, data } = makeProps({ content: '!rc unknown' });

        await expect(messageCreateHandler.handler({ api, data })).resolves.not.toThrow();
    });
});
