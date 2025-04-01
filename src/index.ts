import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import '@sapphire/plugin-logger/register';
import { GatewayIntentBits, Events, ChannelType } from 'discord.js';
import * as https from 'https';

const client = new SapphireClient({
	caseInsensitiveCommands: true,
	logger: {
		instance: new Logger({ level: LogLevel.Debug })
	},
	intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
	loadMessageCommandListeners: true
});

// Listen for messages in #general channel
client.on(Events.MessageCreate, (message) => {
	if (message.channel.type === ChannelType.GuildText && message.channel.name === 'general' && !message.author.bot) {
		client.logger.debug(`Message in #general from ${message.author.tag}: ${message.content}`);
		console.log(message.content);
		
		// Send empty request to webhook URL
		const webhookUrl = process.env.WEBHOOK_URL;
		if (webhookUrl) {
			try {
				// Use built-in https module instead of node-fetch
				const req = https.get(webhookUrl, (res) => {
					client.logger.debug(`Sent webhook request to ${webhookUrl}, status: ${res.statusCode}`);
				});
				
				req.on('error', (error) => {
					client.logger.error(`Failed to send webhook request: ${error}`);
				});
				
				req.end();
			} catch (error) {
				client.logger.error(`Failed to send webhook request: ${error}`);
			}
		} else {
			client.logger.warn('WEBHOOK_URL environment variable not set');
		}
	}
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login(process.env.DISCORD_TOKEN);
		client.logger.info('Logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

main().catch((error) => {
	client.logger.fatal(error);
	void client.destroy();
	process.exit(1);
});
