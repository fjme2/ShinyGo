require('dotenv').config({path: __dirname + '/.env'});
var express = require("express");
const Telegraf = require("telegraf");

const PORT = process.env.PORT || 5000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const mensajeBienvenida = `Bienvenido a ShinyGo Bot!
Para ver mis funciones usa el comando /help`;

var app = express();
app.get('/', (req, res) => {
  bot.start(ctx => ctx.reply(mensajeBienvenida));
  bot.launch();
});

/*bot.start(ctx => ctx.reply(mensajeBienvenida));
bot.launch();*/

app.listen(PORT, () => {
  console.log(`REST API on http://localhost:${PORT}`);
});
