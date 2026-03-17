import type { API } from '@discordjs/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('discord-message-builder', () => ({
    DiscordMessageBuilder: {
        parseMessages: vi.fn().mockReturnValue([
            { message: 'text only', authorNickname: 'Nick', authorUsername: 'user', imgLocation: null },
            { message: 'with image', authorNickname: 'PicPoster', authorUsername: 'picposter', imgLocation: '1234567890.png' },
        ]),
    },
}));
vi.mock('fs', () => ({ readFileSync: vi.fn().mockReturnValue(Buffer.from('fake-image-data')) }));

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
    it('sends text content only when imgLocation is null', async () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // selects index 0 (no image)
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc quote' };

        await commands.quote({ api, data });
        randomSpy.mockRestore();

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: '"text only" -Nick',
            message_reference: { message_id: 'msg-1' },
        });
    });

    it('sends image attachment when imgLocation is set', async () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5); // selects index 1 (with image)
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc quote' };

        await commands.quote({ api, data });
        randomSpy.mockRestore();

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: '"with image" -PicPoster',
            message_reference: { message_id: 'msg-1' },
            files: [{ name: '1234567890.png', data: Buffer.from('fake-image-data') }],
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
