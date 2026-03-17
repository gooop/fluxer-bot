import type { API } from '@discordjs/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DiscordMessageBuilder, type DiscordMessage } from 'discord-message-builder';

type CommandProps = {
    api: API;
    data: { channel_id: string; id: string; content: string };
};

let _quotes: DiscordMessage[] | null = null;

function getQuotes(): DiscordMessage[] {
    if (_quotes === null) {
        const json = readFileSync(resolve(__dirname, '../../pinned-messages.json'), 'utf-8');
        _quotes = DiscordMessageBuilder.parseMessages(json);
    }
    return _quotes;
}

export const commands = {
    quote: async ({ api, data }: CommandProps) => {
        const quotes = getQuotes();
        const { message, authorNickname, authorUsername } = quotes[Math.floor(Math.random() * quotes.length)];
        const author = authorNickname || authorUsername;
        await api.channels.createMessage(data.channel_id, {
            content: `"${message}" -${author}`,
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
