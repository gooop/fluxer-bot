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

        if (data.content.toLowerCase() === '!rc quote start') {
            log.info(`@${data.author.username}#${data.author.discriminator} called !rc quote start`);
            try {
                await commands.quoteStart({ api, data });
            } catch (err) {
                log.error('quoteStart failed with error: ', err);
            }
        } else if (data.content.toLowerCase() === '!rc quote stop') {
            log.info(`@${data.author.username}#${data.author.discriminator} called !rc quote stop`);
            try {
                await commands.quoteStop({ api, data });
            } catch (err) {
                log.error('quoteStop failed with error: ', err);
            }
        } else if (data.content.toLowerCase() === '!rc quote') {
            log.info(`@${data.author.username}#${data.author.discriminator} called !rc quote`);
            try {
                await commands.quote({ api, data });
            } catch (err) {
                log.error('quote failed with error: ', err);
            }
        } else if (data.content.toLowerCase() === '!rc ping') {
            log.info(`@${data.author.username}#${data.author.discriminator} called !rc ping`);
            try {
                await commands.ping({ api, data });
            } catch (err) {
                log.error('ping failed with error: ', err);
            }
        } else if (data.content.startsWith('!rc')) {
            log.info(`@${data.author.username}#${data.author.discriminator} called unknown command: ${data.content}`);
            try {
                await commands.default({ api, data });
            } catch (err) {
                log.error('default failed with error: ', err);
            }
        }
    },
);
