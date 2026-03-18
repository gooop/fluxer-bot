import type { API } from '@discordjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../quotes', () => ({
    quotes: [
        {
            message: 'text only',
            authorNickname: 'Nick',
            authorUsername: 'user',
            imgLocation: null,
            timeSent: new Date(2023, 11, 3), // December 3, 2023
        },
        {
            message: 'with image',
            authorNickname: 'PicPoster',
            authorUsername: 'picposter',
            imgLocation: '1234567890.png',
            timeSent: new Date(2022, 8, 15), // September 15, 2022
        },
    ],
}));

vi.mock('fs', () => ({
    readFileSync: vi.fn().mockReturnValue(Buffer.from('fake-image-data')),
    existsSync: vi.fn().mockReturnValue(true),
    writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from 'fs';
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
    let createMessage: ReturnType<typeof vi.fn>;
    let api: API;
    let data: { channel_id: string; id: string; content: string };
    let randomSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        createMessage = vi.fn().mockResolvedValue({});
        api = { channels: { createMessage } } as unknown as API;
        data = { channel_id: 'chan-1', id: 'msg-1', content: '!rc quote' };
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    it('sends contextual text quote when imgLocation is null', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // Math.floor(0 * 2) = 0 → text-only quote

        await commands.quote({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'On December 3rd, 2023, Nick said "text only"',
            message_reference: { message_id: 'msg-1' },
        });
    });

    it('sends image attachment with contextual content when imgLocation is set', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5); // Math.floor(0.5 * 2) = 1 → image quote

        await commands.quote({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'On September 15th, 2022, PicPoster said "with image"',
            message_reference: { message_id: 'msg-1' },
            files: [{ name: '1234567890.png', data: Buffer.from('fake-image-data') }],
            attachments: [{ id: '0', filename: '1234567890.png' }],
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
