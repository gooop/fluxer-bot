import type { API } from '@discordjs/core';

type CommandProps = {
    api: API;
    data: { channel_id: string; id: string; content: string };
};

const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Jobs' },
    { text: 'In the middle of every difficulty lies opportunity.', author: 'Einstein' },
    {
        text: 'It does not matter how slowly you go as long as you do not stop.',
        author: 'Confucius',
    },
    { text: 'Life is what happens when you are busy making other plans.', author: 'Lennon' },
    {
        text: 'The future belongs to those who believe in the beauty of their dreams.',
        author: 'Roosevelt',
    },
];

export const commands = {
    quote: async ({ api, data }: CommandProps) => {
        const { text, author } = quotes[Math.floor(Math.random() * quotes.length)];
        await api.channels.createMessage(data.channel_id, {
            content: `"${text}" -${author}`,
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
