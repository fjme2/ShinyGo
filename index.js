require("dotenv").config({ path: __dirname + "/.env" });
var express = require("express");
const fetch = require("node-fetch");
const stardust = require("./stardust.json");

//libreria reconocimiento de texto
const tesseract = require("tesseract.js"); //https://github.com/naptha/tesseract.js

//librerias telegram
const Telegraf = require("telegraf"); //https://telegraf.js.org/#/?id=telegraf
const Telegram = require("telegraf/telegram");
const bot = new Telegraf(process.env.BOT_TOKEN);
const telegram = new Telegram(process.env.BOT_TOKEN);

//librerias de imagenes
const sharp = require("sharp"); //https://github.com/lovell/sharp
var rePattern = new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/); //Encontrar nivel con regex

const PORT = process.env.PORT || 5000;
const mensajeBienvenida = `Bienvenido a ShinyGo Bot!
Para ver mis funciones usa el comando /help`;
const mensajeAyuda = `Para calcular los polvos estelares/caramelos/cantidad de subidas de nivel que se necesitan de un nivel a otro utiliza:\n/calcular NivelInicial NivelFinal`;

var app = express();
app.get("/", (req, res) => {
  res.send("Holi Marta!");
});

bot.start(ctx => ctx.reply(mensajeBienvenida));

const calcular = peticion => {
  var pregunta = peticion.split(" ");
  if (pregunta.length != 3) {
    return `La cantidad de datos no es correcta`;
  }
  try {
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
        datos0.PowerUps} subidas de nivel con:\n${datos1.CandyTotal -
        datos0.CandyTotal} caramelos y ${datos1.StardustTotal -
        datos0.StardustTotal} polvos estelares.`;
    } else if (nivFinal < nivInicial) {
      return `Se necesitan ${datos0.PowerUps -
        datos1.PowerUps} subidas de nivel con:\n${datos0.CandyTotal -
        datos1.CandyTotal} caramelos y ${datos0.StardustTotal -
        datos1.StardustTotal} polvos estelares.`;
    }
  } catch (e) {
    console.log(e);
    return `Error en los calculos`;
  }
};

bot.command("calcular", ctx => {
  var respuesta = calcular(ctx.message.text);
  ctx.reply(respuesta);
});

bot.use(async ctx => {
  if (ctx.message.caption) {
    var peticion = ctx.message.caption.split(" ");

    if (peticion[0].toUpperCase() === "/CALCY") {
      var respuesta = await calcularCalcy(
        ctx.message,
        peticion[0],
        peticion[1]
      );
      ctx.reply(respuesta);
    }
  }
});

async function calcularCalcy(peticion, calcy, endLevel) {
  if (!endLevel || !peticion.photo) {
    return `Error en el comando`;
  }
  if (peticion.photo) {
    //recogemos datos de la imagen
    const image = peticion.photo[2].file_id;
    const width = peticion.photo[2].width;
    const height = peticion.photo[2].height;
    const inicio = parseInt(height / 3, 10);
    const fin = parseInt(height / 6, 10);
    const y = parseInt(width / 2.5, 10);
    var foto = await telegram.getFileLink(image);
    //console.log(foto);

    //recogemos la foto de la bd de telegram y la convertimos en buffer
    var probar = await fetch(foto).then(function(response) {
      return response.buffer();
    });

    //cortamos la foto y la convertimos en buffer
    const prueba = await sharp(probar)
      .extract({ left: y, top: inicio, width: y, height: fin })
      /*.toFile('prueba.jpeg', function(err) {
      console.log(err);
      // Extract a region of the input image, saving in the same format.
    })*/
      .toBuffer()
      .then(data => {
        return data;
      })
      .catch(err => {
        return err;
      });

    //console.log(prueba);

    //Sacamos el texto de la imagen
    var texto = await tesseract
      .recognize(prueba, "eng")
      .then(({ data: { text } }) => {
        console.log(text);
        return text;
      });

    var cortado = texto.split(" ");
    var level;
    console.log(cortado);
    //Buscamos dentro del texto encontrado si está el nivel
    for (var datos of cortado) {
      if (datos.match(rePattern)) {
        level = datos;
        break;
      }
    }

    console.log(level);

    //Si está hacemos los calculos
    if (level) {
      var esta = calcular(calcy + " " + level + " " + endLevel);
      return esta;
    } else {
      return `La imagen no tiene nivel`;
    }
  }
}

bot.help(ctx => ctx.reply(mensajeAyuda));

bot.launch();

app.listen(PORT, () => {
  console.log(`REST API on http://localhost:${PORT}`);
});
