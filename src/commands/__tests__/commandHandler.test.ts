import type { API } from '@discordjs/core';
import { describe, expect, it, vi } from 'vitest';
import { commands } from '../commandHandler';

describe('commands.default', () => {
    it('sends a not-recognised message for the typed subcommand', async () => {
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc foobar' };

        await commands.default({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'foobar is not a recognized command',
            message_reference: { message_id: 'msg-1' },
        });
    });
});

describe('commands.quote', () => {
    it('calls createMessage with a quote in the correct format', async () => {
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc quote' };

        await commands.quote({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: expect.stringMatching(/^".+" -\w+$/),
            message_reference: { message_id: 'msg-1' },
        });
    });
});

describe('commands.ping', () => {
    it('calls createMessage with pong', async () => {
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc ping' };

        await commands.ping({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'pong!',
            message_reference: { message_id: 'msg-1' },
        });
    });
});
