import { GatewayDispatchEvents } from '@discordjs/core';
import { commands } from '../commands/commandHandler';
import { createLogger } from '../logger';
import { createEventHandler } from './eventHandler';

const log = createLogger('messageCreate');

export const messageCreateHandler = createEventHandler(
    GatewayDispatchEvents.MessageCreate,
    async ({ api, data }) => {
        if (data.author.bot) {
            return;
        }

        if (data.content === '!ping') {
            log.info(`@${data.author.username}#${data.author.discriminator} called !ping`);
            await commands.ping({ api, data });
        }
    },
);
