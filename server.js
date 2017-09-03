
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
/**
 * Set up a basic Express server.
 */
app.set('port', port);
app.use(express.static(__dirname + '/public'));
//load images
app.use('/img/chesspieces/wikipedia', express.static(__dirname + '/public/libs/chessboardjs-0.3.0/img/chesspieces/wikipedia'))

//load views
app.use(express.static(__dirname + '/public/views'));

/**
 * Routes
 */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/local', function(req, res) {
    res.sendFile(__dirname + '/public/views/local.html')
});

app.get('/ai', function(req, res) {
    res.sendFile(__dirname + '/public/views/ai.html')
});

server.listen(port, function() {
    console.log('Express server listening.');
});