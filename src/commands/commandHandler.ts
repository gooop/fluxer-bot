import type { API } from '@discordjs/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DiscordMessageBuilder } from 'discord-message-builder';

type CommandProps = {
    api: API;
    data: { channel_id: string; id: string; content: string };
};

const quotes = DiscordMessageBuilder.parseMessages(
    readFileSync(resolve(__dirname, '../../pinned-messages.json'), 'utf-8'),
    { useLocalImages: true },
);

export const commands = {
    quote: async ({ api, data }: CommandProps) => {
        const { message, authorNickname, authorUsername, imgLocation } = quotes[Math.floor(Math.random() * quotes.length)];
        const author = authorNickname || authorUsername;
        const imageAttachment = imgLocation
            ? {
                  files: [{ name: imgLocation, data: readFileSync(resolve(__dirname, '../../pinned-message-contents', imgLocation)) }],
                  attachments: [{ id: '0', filename: imgLocation }],
              }
            : {};
        await api.channels.createMessage(data.channel_id, {
            content: `"${message}" -${author}`,
            message_reference: { message_id: data.id },
            ...imageAttachment,
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
