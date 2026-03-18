import type { API } from '@discordjs/core';
import { GatewayDispatchEvents } from '@discordjs/core';
import type { GatewayReadyDispatchData } from 'discord-api-types/v10';
import { describe, expect, it, vi } from 'vitest';
import { readyHandler } from '../ready';

vi.mock('../../scheduler', () => ({
    initScheduler: vi.fn(),
}));

import { initScheduler } from '../../scheduler';

describe('readyHandler', () => {
    it('has the correct event type', () => {
        expect(readyHandler.event).toBe(GatewayDispatchEvents.Ready);
    });

    it('runs without error', () => {
        const data = {
            user: { username: 'FluxerBot', discriminator: '1234' },
        } as unknown as GatewayReadyDispatchData;

        expect(() =>
            readyHandler.handler({
                api: {} as API,
                data,
            }),
        ).not.toThrow();
    });

    it('calls initScheduler with the api', () => {
        const api = { channels: {} } as unknown as API;
        const data = {
            user: { username: 'FluxerBot', discriminator: '1234' },
        } as unknown as GatewayReadyDispatchData;

        readyHandler.handler({ api, data });

        expect(initScheduler).toHaveBeenCalledWith(api);
    });
});
