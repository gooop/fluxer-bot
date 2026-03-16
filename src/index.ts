import { Client, GatewayDispatchEvents } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { createLogger } from './logger.js';

const log = createLogger('index');

const token = process.env['FLUXER_BOT_TOKEN'];
if (!token) {
    throw new Error('You forgot the token!');
}

const rest = new REST({ api: 'https://api.fluxer.app', version: '1' }).setToken(token);

const gateway = new WebSocketManager({
    intents: 0,
    rest,
    token,
    version: '1',
});

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.MessageCreate, async ({ api, data }) => {
    if (data.author.bot) {
        return;
    }

    if (data.content === '!ping') {
        await api.channels.createMessage(data.channel_id, {
            content: 'pong!',
            message_reference: { message_id: data.id },
        });
    }
});

client.on(GatewayDispatchEvents.Ready, ({ data }) => {
    const { username, discriminator } = data.user;
    log.info(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();
