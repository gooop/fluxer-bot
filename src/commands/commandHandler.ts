import type { API } from '@discordjs/core';

type CommandProps = {
    api: API;
    data: { channel_id: string; id: string; content: string };
};

export const commands = {
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
