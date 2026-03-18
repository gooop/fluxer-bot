import { GatewayDispatchEvents } from '@discordjs/core';
import { initScheduler } from '../scheduler';
import { createLogger } from '../logger';
import { createEventHandler } from './eventHandler';

const log = createLogger('ready');

export const readyHandler = createEventHandler(GatewayDispatchEvents.Ready, ({ api, data }) => {
    const { username, discriminator } = data.user;
    log.info(`Logged in as @${username}#${discriminator}`);
    initScheduler(api);
});
