require('dotenv').config({path: __dirname + '/.env'});
var express = require("express");
const Telegraf = require("telegraf");

const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const mensajeBienvenida = `Bienvenido a ShinyGo Bot!
Para ver mis funciones usa el comando /help`;

bot.start(ctx => ctx.reply(mensajeBienvenida));
bot.launch();

var app = express();
app.listen(PORT, () => {
  console.log(`REST API on http://localhost:${PORT}`);
});
