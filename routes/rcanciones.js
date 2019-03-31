module.exports = function(app, swig, gestorBD) {
    app.get("/canciones", function(req, res) {
        var canciones = [ {
            "nombre" : "Blank space",
            "precio" : "1.2"
        }, {
            "nombre" : "See you again",
            "precio" : "1.3"
        }, {
            "nombre" : "Uptown Funk",
            "precio" : "1.1"
        } ];
        var respuesta = swig.renderFile('views/btienda.html', {
            vendedor : 'Tienda de canciones',
            canciones : canciones
        });
        res.send(respuesta);
    });

    app.get('/suma', function(req, res) {
        var respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/canciones/:id', function(req, res) {
        var respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get('/canciones/:genero/:id', function(req, res) {
        var respuesta = 'id: ' + req.params.id + '<br>'
            + 'Genero: ' + req.params.genero;
        res.send(respuesta);
    });

    app.post("/cancion", function(req, res) {
        var cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                res.send("Agregada id: " + id);
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function(err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            if (req.files.audio != null) {
                                var audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.send("Agregada id: "+ id);
                                    }
                                });
                            }
                        }
                    });
                }
            }

        });

    });

    app.get('/canciones/agregar', function (req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.get("/tienda", function(req, res) {
        var criterio = {};
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if( req.query.busqueda != null ){
                criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"} };
            }
            var pg = parseInt(req.query.pg); // Es String !!!
            if ( req.query.pg == null){ // Puede no venir el param
                pg = 1;
            }

            gestorBD.obtenerCancionesPg(criterio, pg , function(canciones, total ) {
                if (canciones == null) {
                    res.send("Error al listar ");
                } else {
                    var ultimaPg = total/4;
                    if (total % 4 > 0 ){ // Sobran decimales
                        ultimaPg = ultimaPg+1;
                    }
                    var paginas = []; // paginas mostrar
                    for(var i = pg-2 ; i <= pg+2 ; i++){
                        if ( i > 0 && i <= ultimaPg){
                            paginas.push(i);
                        }
                    }
                    var respuesta = swig.renderFile('views/btienda.html',
                        {
                            canciones : canciones,
                            paginas : paginas,
                            actual : pg
                        });
                    res.send(respuesta);
                }
            });

        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        var criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        var cancionId = gestorBD.mongo.ObjectID(req.params.id);
        var compra = {
            usuario : req.session.usuario,
            cancionId : cancionId
        }
        gestorBD.insertarCompra(compra ,function(idCompra){
            if ( idCompra == null ){
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    });


};
