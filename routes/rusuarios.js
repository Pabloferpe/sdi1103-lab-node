module.exports = function(app, swig, mongo) {
    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });
};
