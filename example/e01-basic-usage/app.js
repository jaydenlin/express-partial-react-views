var http = require('http');
var path = require("path");
var express = require('express');
var app = express();
//set up views path. the folder for the base htmls. 
app.set('views', __dirname + '/src');
//set up the extensions for base htmls 
app.set('view engine', 'html');
//set up the react component folder. the view engine will find components from here. 
app.set('reactComponentFolder', __dirname + '/src/components');
//set up the view engine 
var engine = require('../../index');
app.engine('html', engine.createEngine());

app.get("/", function(req, res) {

	res.render("index");

});

var server = http.createServer(app);
server.listen(process.env.PORT || 8080, function() {
	console.log("Listening on %j", server.address());

});