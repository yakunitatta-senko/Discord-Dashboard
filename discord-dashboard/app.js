// app.js

const { Client, GatewayIntentBits, Intents } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildChannels,
    GatewayIntentBits.GuildMessages,
  ],
});

// Event listeners
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  fetchApiEndpoints(); // Fetch API endpoints when the bot is ready
});

client.on('guildCreate', guild => {
  console.log(`Joined a new guild: ${guild.name}`);
  fetchApiEndpoints(); // Re-fetch API endpoints when the bot joins a new guild
});

client.on('guildDelete', guild => {
  console.log(`Left a guild: ${guild.name}`);
  fetchApiEndpoints(); // Re-fetch API endpoints when the bot leaves a guild
});

client.on('messageCreate', message => {
  // You can update the message log dynamically here
  const messageData = [{
    username: message.author.username,
    avatarURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }),
    content: message.content,
  }];
  updateMessageLog(messageData);
});

// Fetch API endpoints dynamically
async function fetchApiEndpoints() {
  await client.login('YOUR_BOT_TOKEN'); // Replace with your bot token

  const guild = client.guilds.cache.first(); // Assuming the bot is part of a guild

  if (!guild) {
    console.error('Bot is not part of any guild.');
    return;
  }

  // Get guild ID and bot user ID
  const guildId = guild.id;
  const botUserId = client.user.id;

  // Get API endpoints dynamically
  const usersEndpoint = `/guilds/${guildId}/members/${botUserId}`;
  const channelsEndpoint = `/guilds/${guildId}/channels`;
  const messagesEndpoint = `/guilds/${guildId}/channels/CHANNEL_ID/messages`; // Replace CHANNEL_ID with an actual channel ID

  console.log('Users Endpoint:', usersEndpoint);
  console.log('Channels Endpoint:', channelsEndpoint);
  console.log('Messages Endpoint:', messagesEndpoint);

  // Use the fetched endpoints to update the HTML content
  const userData = await fetchData(usersEndpoint);
  const channelData = await fetchData(channelsEndpoint);
  const messageData = await fetchData(messagesEndpoint);
  updateUserList(userData);
  updateChannelInfo(channelData);
  updateMessageLog(messageData);

  client.destroy(); // Log out the bot after fetching endpoints
}
