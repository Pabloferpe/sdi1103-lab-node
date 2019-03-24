module.exports = function(app, swig, gestorBD) {
    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });

    app.get("/registrarse", function(req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.post('/usuario', function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var usuario = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.insertarUsuario(usuario, function(id) {
            if (id == null){
                res.send("Error al insertar ");
            } else {
                res.send('Usuario Insertado ' + id);
            }
        });

    })

    app.get("/identificarse", function(req, res) {
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.send("No identificado: ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.send("identificado");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.send("Usuario desconectado");
    })

    app.get("/publicaciones", function(req, res) {
        var criterio = { autor : req.session.usuario };
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    })

    function paso1ModificarPortada(files, id, callback){
        if (files.portada != null) {
            var imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };
    function paso2ModificarAudio(files, id, callback){
        if (files.audio != null) {
            var audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };





};
