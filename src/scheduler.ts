import type { API } from '@discordjs/core';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { formatQuote } from './commands/formatQuote';
import { createLogger } from './logger';
import { quotes } from './quotes';

const log = createLogger('scheduler');

const SCHEDULE_PATH = resolve(__dirname, '../schedule.json');
const SUBSCRIBERS_PATH = resolve(__dirname, '../subscribers.json');
const MAX_TIMEOUT_MS = 2 ** 31 - 2; // Node setTimeout max safe delay (~24.8 days)

function readSchedule(): string[] {
    if (!existsSync(SCHEDULE_PATH)) return [];
    return JSON.parse(readFileSync(SCHEDULE_PATH, 'utf-8')) as string[];
}

function writeSchedule(schedule: string[]): void {
    writeFileSync(SCHEDULE_PATH, JSON.stringify(schedule), 'utf-8');
}

function readSubscribers(): string[] {
    if (!existsSync(SUBSCRIBERS_PATH)) return [];
    try {
        return JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8')) as string[];
    } catch {
        return [];
    }
}

export function generateSchedule(month: Date): string[] {
    const now = new Date();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    // Start from tomorrow if scheduling within the current month
    const startDay =
        year === now.getFullYear() && monthIndex === now.getMonth()
            ? now.getDate() + 1
            : 1;

    // If no days remain, fall back to next month
    if (startDay > daysInMonth) {
        return generateSchedule(new Date(year, monthIndex + 1, 1));
    }

    const availableDays = Array.from(
        { length: daysInMonth - startDay + 1 },
        (_, i) => startDay + i,
    );

    const count = Math.random() < 0.5 ? 1 : 2;
    const timestamps: string[] = [];

    for (let i = 0; i < Math.min(count, availableDays.length); i++) {
        const dayIndex = Math.floor(Math.random() * availableDays.length);
        const day = availableDays.splice(dayIndex, 1)[0];
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        timestamps.push(new Date(year, monthIndex, day, hour, minute, 0).toISOString());
    }

    return timestamps.sort();
}

async function fire(api: API, schedule: string[]): Promise<void> {
    schedule.shift();

    const subscribers = readSubscribers();
    if (subscribers.length > 0) {
        const msg = quotes[Math.floor(Math.random() * quotes.length)];
        const { content, imageAttachment } = formatQuote(msg);
        for (const channelId of subscribers) {
            try {
                await api.channels.createMessage(channelId, {
                    content,
                    ...(imageAttachment ?? {}),
                });
            } catch (err) {
                log.error(`failed to post to channel ${channelId}: `, err);
            }
        }
    }

    const hasRemaining = schedule.length > 0;

    if (!hasRemaining) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        schedule.push(...generateSchedule(nextMonth));
    }

    writeSchedule(schedule);

    if (hasRemaining) {
        scheduleNext(api, schedule);
    }
}

function scheduleNext(api: API, schedule: string[]): void {
    if (schedule.length === 0) return;

    const delay = new Date(schedule[0]).getTime() - Date.now();

    if (delay > MAX_TIMEOUT_MS) {
        // Delay too large for a single setTimeout — step forward and re-check
        setTimeout(() => scheduleNext(api, schedule), MAX_TIMEOUT_MS);
        return;
    }

    setTimeout(() => void fire(api, schedule), Math.max(0, delay));
}

export function initScheduler(api: API): void {
    const now = new Date();
    let schedule = readSchedule().filter(t => new Date(t) > now);

    if (schedule.length === 0) {
        schedule = generateSchedule(now);
        writeSchedule(schedule);
    }

    scheduleNext(api, schedule);
}
