import { Client } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { registerEventHandlers } from './events/eventHandler';
import { messageCreateHandler } from './events/messageCreate';
import { readyHandler } from './events/ready';

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

registerEventHandlers(client, [messageCreateHandler, readyHandler]);

gateway.connect();
