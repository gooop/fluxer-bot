import type { API } from '@discordjs/core';
import { describe, expect, it, vi } from 'vitest';
import { commands } from '../commandHandler';

describe('commands.ping', () => {
    it('calls createMessage with pong', async () => {
        const createMessage = vi.fn().mockResolvedValue({});
        const api = { channels: { createMessage } } as unknown as API;
        const data = { channel_id: 'chan-1', id: 'msg-1' };

        await commands.ping({ api, data });

        expect(createMessage).toHaveBeenCalledWith('chan-1', {
            content: 'pong!',
            message_reference: { message_id: 'msg-1' },
        });
    });
});
