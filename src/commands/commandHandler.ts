import type { API } from '@discordjs/core';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { formatQuote } from './formatQuote';
import { quotes } from '../quotes';

const SUBSCRIBERS_PATH = resolve(__dirname, '../../subscribers.json');

type CommandProps = {
    api: API;
    data: { channel_id: string; id: string; content: string };
};

function readSubscribers(): string[] {
    if (!existsSync(SUBSCRIBERS_PATH)) return [];
    try {
        return JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8')) as string[];
    } catch {
        return [];
    }
}

function writeSubscribers(subscribers: string[]): void {
    writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers), 'utf-8');
}

function pickRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

export const commands = {
    quote: async ({ api, data }: CommandProps) => {
        const msg = pickRandomQuote();
        const { content, imageAttachment } = formatQuote(msg);
        await api.channels.createMessage(data.channel_id, {
            content,
            message_reference: { message_id: data.id },
            ...(imageAttachment ?? {}),
        });
    },
    quoteStart: async ({ api, data }: CommandProps) => {
        const msg = pickRandomQuote();
        const { content, imageAttachment } = formatQuote(msg);
        await api.channels.createMessage(data.channel_id, {
            content,
            ...(imageAttachment ?? {}),
        });
        const subscribers = readSubscribers();
        if (!subscribers.includes(data.channel_id)) {
            subscribers.push(data.channel_id);
            writeSubscribers(subscribers);
        }
        await api.channels.createMessage(data.channel_id, {
            content: 'Scheduled quotes enabled for this channel.',
            message_reference: { message_id: data.id },
        });
    },
    quoteStop: async ({ api, data }: CommandProps) => {
        const subscribers = readSubscribers();
        writeSubscribers(subscribers.filter(id => id !== data.channel_id));
        await api.channels.createMessage(data.channel_id, {
            content: 'Scheduled quotes disabled for this channel.',
            message_reference: { message_id: data.id },
        });
    },
    ping: async ({ api, data }: CommandProps) => {
        await api.channels.createMessage(data.channel_id, {
            content: 'pong!',
            message_reference: { message_id: data.id },
        });
    },
    default: async ({ api, data }: CommandProps) => {
        const subcommand = data.content.replace(/^!rc\s*/i, '');
        await api.channels.createMessage(data.channel_id, {
            content: `${subcommand} is not a recognized command`,
            message_reference: { message_id: data.id },
        });
    },
};
