var express = require('express');
var bp = require('body-parser');

var app = express();
app.use(bp.json());

app.listen(3000, function () {
    console.log("El servidor express está en el puerto 3000");
});