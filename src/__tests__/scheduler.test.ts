import type { API } from '@discordjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
}));

vi.mock('../commands/formatQuote', () => ({
    formatQuote: vi.fn(() => ({
        content: 'On January 1st, 2023, Nick said "hello"',
        imageAttachment: null,
    })),
}));

vi.mock('../quotes', () => ({
    quotes: [
        { message: 'hello', authorNickname: 'Nick', authorUsername: 'nick', timeSent: new Date(), imgLocation: null },
    ],
}));

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { generateSchedule, initScheduler, resetScheduler } from '../scheduler';

const MARCH_17 = new Date(2026, 2, 17, 12, 0, 0); // March 17, 2026 noon

function mockFs(scheduleJson: string, subscribersJson = '[]'): void {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation((path: unknown) => {
        if (String(path).includes('schedule.json')) return scheduleJson;
        if (String(path).includes('subscribers.json')) return subscribersJson;
        return '[]';
    });
}

describe('generateSchedule', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(MARCH_17);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('returns 1 timestamp when Math.random < 0.5', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.3);
        const result = generateSchedule(new Date(2026, 5, 1)); // June (fully in future)
        expect(result).toHaveLength(1);
    });

    it('returns 2 timestamps when Math.random >= 0.5', () => {
        let call = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => (call++ === 0 ? 0.7 : 0.5));
        const result = generateSchedule(new Date(2026, 5, 1)); // June
        expect(result).toHaveLength(2);
    });

    it('all timestamps are within the given month', () => {
        const result = generateSchedule(new Date(2026, 5, 1)); // June 2026
        for (const ts of result) {
            const d = new Date(ts);
            expect(d.getMonth()).toBe(5);
            expect(d.getFullYear()).toBe(2026);
        }
    });

    it('returns sorted timestamps', () => {
        let call = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => (call++ === 0 ? 0.7 : 0.5));
        const result = generateSchedule(new Date(2026, 5, 1));
        expect(result).toEqual([...result].sort());
    });

    it('falls back to next month when all days of given month are past', () => {
        vi.setSystemTime(new Date(2026, 2, 31, 23)); // March 31 — tomorrow = April 1
        const result = generateSchedule(new Date(2026, 2, 1)); // March (startDay = 32 > 31)
        for (const ts of result) {
            expect(new Date(ts).getMonth()).toBe(3); // April
        }
    });

    it('schedules only within the remaining days of the current month', () => {
        // March 17 → startDay = 18, so no timestamp should be before March 18
        const result = generateSchedule(MARCH_17);
        for (const ts of result) {
            expect(new Date(ts).getDate()).toBeGreaterThanOrEqual(18);
        }
    });
});

describe('initScheduler', () => {
    let api: API;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(MARCH_17);
        api = { channels: { createMessage: vi.fn().mockResolvedValue({}) } } as unknown as API;
        vi.mocked(writeFileSync).mockReset();
        resetScheduler();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('generates and writes a schedule when no file exists', () => {
        vi.mocked(existsSync).mockReturnValue(false);

        initScheduler(api);

        expect(writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('schedule.json'),
            expect.any(String),
            'utf-8',
        );
    });

    it('filters out past timestamps and regenerates when all are past', () => {
        mockFs(JSON.stringify(['2026-01-01T12:00:00.000Z', '2026-02-01T12:00:00.000Z']));

        initScheduler(api);

        // Should write a new schedule with future timestamps
        const written = vi.mocked(writeFileSync).mock.calls[0][1] as string;
        const schedule = JSON.parse(written) as string[];
        expect(schedule.every(ts => new Date(ts) > MARCH_17)).toBe(true);
    });

    it('sets a setTimeout for the next scheduled time', () => {
        const futureTime = new Date(2026, 2, 20, 14, 30).toISOString(); // March 20
        mockFs(JSON.stringify([futureTime]));

        initScheduler(api);

        expect(vi.getTimerCount()).toBe(1);
    });

    it('posts to all subscribed channels when timer fires', async () => {
        const futureTime = new Date(2026, 2, 17, 12, 1).toISOString(); // 1 minute from now
        const createMessage = vi.fn().mockResolvedValue({});
        api = { channels: { createMessage } } as unknown as API;
        mockFs(JSON.stringify([futureTime]), JSON.stringify(['chan-1', 'chan-2']));

        initScheduler(api);
        await vi.advanceTimersByTimeAsync(60_000);

        expect(createMessage).toHaveBeenCalledWith('chan-1', expect.objectContaining({ content: expect.any(String) }));
        expect(createMessage).toHaveBeenCalledWith('chan-2', expect.objectContaining({ content: expect.any(String) }));
    });

    it('does not send duplicate messages when called twice (e.g. on reconnect)', async () => {
        const futureTime = new Date(2026, 2, 17, 12, 1).toISOString(); // 1 minute from now
        const createMessage = vi.fn().mockResolvedValue({});
        api = { channels: { createMessage } } as unknown as API;
        mockFs(JSON.stringify([futureTime]), JSON.stringify(['chan-1']));

        initScheduler(api);
        initScheduler(api); // simulates Ready firing twice (e.g. on reconnect)
        await vi.advanceTimersByTimeAsync(60_000);

        // Should only message chan-1 once, not once per scheduler instance
        expect(createMessage).toHaveBeenCalledTimes(1);
    });

    it('does not post when there are no subscribers', async () => {
        const futureTime = new Date(2026, 2, 17, 12, 1).toISOString();
        const createMessage = vi.fn().mockResolvedValue({});
        api = { channels: { createMessage } } as unknown as API;
        mockFs(JSON.stringify([futureTime]), '[]');

        initScheduler(api);
        await vi.advanceTimersByTimeAsync(60_000);

        expect(createMessage).not.toHaveBeenCalled();
    });

    it('one failing channel does not prevent others from receiving', async () => {
        const futureTime = new Date(2026, 2, 17, 12, 1).toISOString();
        const createMessage = vi.fn()
            .mockRejectedValueOnce(new Error('chan-1 failed'))
            .mockResolvedValue({});
        api = { channels: { createMessage } } as unknown as API;
        mockFs(JSON.stringify([futureTime]), JSON.stringify(['chan-1', 'chan-2']));

        initScheduler(api);
        await vi.advanceTimersByTimeAsync(60_000);

        expect(createMessage).toHaveBeenCalledTimes(2);
        expect(createMessage).toHaveBeenCalledWith('chan-2', expect.any(Object));
    });
});
