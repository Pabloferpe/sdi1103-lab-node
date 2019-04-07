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
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");

            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/publicaciones");
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
                res.redirect("/registrarse?mensaje=Error al registrar usuario")
            } else {
                res.send('Usuario Insertado ' + id);
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
            }
        });
    })

    app.get('/compras', function (req, res) {
        var criterio = { "usuario" : req.session.usuario };
        gestorBD.obtenerCompras(criterio ,function(compras){
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                var cancionesCompradasIds = [];
                for(i=0; i < compras.length; i++){
                    cancionesCompradasIds.push( compras[i].cancionId );
                }
                var criterio = { "_id" : { $in: cancionesCompradasIds } }
                gestorBD.obtenerCanciones(criterio ,function(canciones){
                    var respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    })


    app.post("/api/autenticar/", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado : false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true
                    token : token
                })
            }

        });
    });


};
