import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DiscordMessage } from 'discord-message-builder';

export type ImageAttachment = {
    files: { name: string; data: Buffer }[];
    attachments: { id: string; filename: string }[];
};

export type FormatQuoteResult = {
    content: string;
    imageAttachment: ImageAttachment | null;
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function ordinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function formatDate(date: Date): string {
    const day = date.getDate();
    return `${MONTHS[date.getMonth()]} ${day}${ordinalSuffix(day)}, ${date.getFullYear()}`;
}

const URL_PATTERN = /^https?:\/\/\S+$/;

export function formatQuote(msg: DiscordMessage): FormatQuoteResult {
    const author = msg.authorNickname || msg.authorUsername;
    const date = formatDate(msg.timeSent);

    const imageAttachment: ImageAttachment | null = msg.imgLocation
        ? {
              files: [{ name: msg.imgLocation, data: readFileSync(resolve(__dirname, '../../pinned-message-contents', msg.imgLocation)) }],
              attachments: [{ id: '0', filename: msg.imgLocation }],
          }
        : null;

    let content: string;
    if (msg.message === '' && msg.imgLocation !== null) {
        content = `On ${date}, ${author} posted this picture.`;
    } else if (URL_PATTERN.test(msg.message) && msg.imgLocation === null) {
        content = `On ${date}, ${author} posted this link ${msg.message}`;
    } else {
        content = `On ${date}, ${author} said "${msg.message}"`;
    }

    return { content, imageAttachment };
}
