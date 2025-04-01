import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import '@sapphire/plugin-logger/register';
import { GatewayIntentBits, Events, ChannelType } from 'discord.js';

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
	if (message.channel.type === ChannelType.GuildText && 
		message.channel.name === 'general' && 
		!message.author.bot) {
		client.logger.debug(`Message in #general from ${message.author.tag}: ${message.content}`);
		console.log(message.content);
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
