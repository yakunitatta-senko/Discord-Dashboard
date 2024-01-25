const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch/lib/index.js');
const ejs = require('ejs');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const guild = client.guilds.cache.first();

    if (!guild) {
      console.error('Bot is not part of any guild.');
      return res.status(500).send('Bot is not part of any guild.');
    }

    const guildId = guild.id;
    const botUserId = client.user.id;

    const usersEndpoint = `/guilds/${guildId}/members`;
    const channelsEndpoint = `/guilds/${guildId}/channels`;

    const userData = await fetchData(usersEndpoint);
    const channelData = await fetchData(channelsEndpoint);

    const renderedHtml = await ejs.renderFile(path.join(__dirname, 'public', 'index.html'), { userData, channelData });

    res.send(renderedHtml);
  } catch (error) {
    console.error('Error rendering HTML:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const BOT_TOKEN = "MTE5OTkwMTgyMzEyMTc2MDMyNw.GAZufs.2eoI4grTDpCn7uDeFnUoabuoATx4fUfyxOTK2s";

if (!BOT_TOKEN) {
  console.error('Bot token not provided. Make sure to set the BOT_TOKEN environment variable.');
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  });

  function updateUserList(userData) {
    console.log('User Data:', userData);
  }

  function updateMessageLog(messageData) {
    console.log('Message Data:', messageData);
  }

  function updateChannelInfo(channelData) {
    console.log('Channel Data:', channelData);
  }

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    fetchApiEndpoints();
  });

  client.on('guildCreate', guild => {
    console.log(`Joined a new guild: ${guild.name}`);
    fetchApiEndpoints();
  });

  client.on('guildDelete', guild => {
    console.log(`Left a guild: ${guild.name}`);
    fetchApiEndpoints();
  });

  client.on('messageCreate', async (message) => {
    if (message.channel.id === '1174127798076571658') {
      const userData = await fetchData(`/users/${message.author.id}`);
      
      io.emit('newMessage', {
        username: message.author.username,
        avatarURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }),
        content: message.content,
      });
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (messageData) => {
      // Handle the new message data as needed
      updateMessageLog(messageData);
    });

    // Handle more socket events here if needed
  });

  async function fetchApiEndpoints() {
    try {
      await client.login(BOT_TOKEN);

      const guild = client.guilds.cache.first();

      if (!guild) {
        console.error('Bot is not part of any guild.');
        return;
      }

      const guildId = guild.id;
      const botUserId = client.user.id;

      const usersEndpoint = `/guilds/${guildId}/members`;
      const channelsEndpoint = `/guilds/${guildId}/channels`;

      console.log('Users Endpoint:', usersEndpoint);
      console.log('Channels Endpoint:', channelsEndpoint);

      const userData = await fetchData(usersEndpoint);
      const channelData = await fetchData(channelsEndpoint);
      updateUserList(userData);
      updateChannelInfo(channelData);

    } catch (error) {
      console.error('Error fetching API endpoints:', error.message);
    }
  }

  async function fetchData(endpoint) {
    const discordApiBaseUrl = 'https://discord.com/api/v10';
    const response = await fetch(`${discordApiBaseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Data not found for endpoint ${endpoint}`);
      } else {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  }

  client.login(BOT_TOKEN);

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
