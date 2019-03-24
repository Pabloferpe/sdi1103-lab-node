// Módulos
var express = require('express');
var app = express();

var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo = require('mongodb');
var swig = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);



app.use(express.static('public'));

// Variables
app.set('port', 8081);



//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);


// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})
