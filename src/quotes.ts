import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DiscordMessageBuilder } from 'discord-message-builder';

export const quotes = DiscordMessageBuilder.parseMessages(
    readFileSync(resolve(__dirname, '../pinned-messages.json'), 'utf-8'),
    { useLocalImages: true },
);
