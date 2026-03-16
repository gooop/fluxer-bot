import { GatewayDispatchEvents } from '@discordjs/core';
import { createLogger } from '../logger';
import { createEventHandler } from './eventHandler';

const log = createLogger('ready');

export const readyHandler = createEventHandler(GatewayDispatchEvents.Ready, ({ data }) => {
    const { username, discriminator } = data.user;
    log.info(`Logged in as @${username}#${discriminator}`);
});
