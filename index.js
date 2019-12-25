require("dotenv").config({ path: __dirname + "/.env" });
var express = require("express");
const Telegraf = require("telegraf");
const stardust = require("./stardust.json");
const tesseract = require("tesseract.js");
const Telegram = require('telegraf/telegram')


const PORT = process.env.PORT || 5000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const telegram = new Telegram(process.env.BOT_TOKEN)

const mensajeBienvenida = `Bienvenido a ShinyGo Bot!
Para ver mis funciones usa el comando /help`;
const mensajeAyuda = `Para calcular los polvos estelares/caramelos/cantidad de subidas de nivel que se necesitan de un nivel a otro utiliza:\n/calcular NivelInicial NivelFinal`

var app = express();
app.get("/", (req, res) => {
  res.send("Holi Marta!");
});

bot.start(ctx => ctx.reply(mensajeBienvenida));

const calcular = pregunta => {
  if (pregunta.length != 3) {
    return `La cantidad de datos no es correcta`;
  }
  try {
    console.log('hola');
    let nivInicial = Number(pregunta[1]);
    let nivFinal = Number(pregunta[2]);
    var datos0;
    var datos1;

    if (nivInicial > 40 || nivInicial < 1 || nivFinal > 40 || nivFinal < 1) {
      return `De momento el nivel inicial en Pokemon Go es 1 y el final es 40`;
    }

    for (var datos of stardust) {
      var nivel = datos.Level + 0.5;

      if (nivel == nivInicial) {
        datos0 = datos;
      }
      if (nivel == nivFinal) {
        datos1 = datos;
      }
    }

    if (nivFinal >= nivInicial) {
      return `Se necesitan ${datos1.PowerUps -
        datos0.PowerUps} subidas de nivel con:\n${datos1.CandyTotal - datos0.CandyTotal} caramelos y  ${datos1.StardustTotal -
        datos0.StardustTotal} polvos estelares.`;
    } else if (nivFinal < nivInicial) {
      return `Se necesitan ${datos0.PowerUps -
        datos1.PowerUps} subidas de nivel con:\n${datos0.CandyTotal - datos1.CandyTotal} caramelos y  ${datos0.StardustTotal -
        datos1.StardustTotal} polvos estelares.`;
    }
  } catch (e) {
    console.log(e);
    return `Error en los calculos`;
  }
};

bot.command("calcular", ctx => {
  var mensaje = ctx.message.text;
  var pregunta = mensaje.split(" ");
  var respuesta = calcular(pregunta);
  ctx.reply(respuesta);
});

//https://github.com/superRaytin/image-clipper/tree/7f06faca601acbe6b84a9ae1c383815927c77477
bot.use(async (ctx) => {
  console.log(ctx.message.photo)
  if(ctx.message.photo){
    const image = ctx.message.photo[2].file_id;
    var foto = await telegram.getFileLink(image);
    console.log(foto);
    await tesseract.recognize(foto, 'eng')
    .then(({ data: { text } }) => {
      console.log(text);
    });
    ctx.reply('La hay');
    //ctx.reply(ctx.message.caption);
  }
})

bot.command("prueba", (ctx) => {
  console.log(ctx.message)
  if(ctx.message.photo){
    ctx.reply('La hay');
  }
})

bot.help((ctx) => ctx.reply(mensajeAyuda))

bot.launch();

app.listen(PORT, () => {
  console.log(`REST API on http://localhost:${PORT}`);
});
