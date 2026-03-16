import { GatewayDispatchEvents } from '@discordjs/core';
import { createEventHandler } from './eventHandler';

export const messageCreateHandler = createEventHandler(
    GatewayDispatchEvents.MessageCreate,
    async ({ api, data }) => {
        if (data.author.bot) {
            return;
        }

        if (data.content === '!ping') {
            await api.channels.createMessage(data.channel_id, {
                content: 'pong!',
                message_reference: { message_id: data.id },
            });
        }
    },
);
