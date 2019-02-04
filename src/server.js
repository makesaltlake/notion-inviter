const botkit = require('botkit');
const notion = require('./notion.js');

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const PORT = process.env.PORT;

const bot = botkit.slackbot({
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET,
  clientSigningSecret: SLACK_SIGNING_SECRET
});

bot.setupWebserver(PORT, (err, server) => {
  bot
    .createHomepageEndpoint(bot.server)
    .createWebhookEndpoints(bot.webserver)
});

bot.on('slash_command', (slashCommand, message) => {
  if (message.command === '/notion-invite') {
    console.log('got a slash command!');
    slashCommand.replyPrivate(message, `Yo, I got it! Here's what you said: ${message}`);
  }
});
