
var express = require('express');
var app = express();
var http = require('http');
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
    res.sendFile(__dirname + '/public/views/local.html');
});

app.get('/ai', function(req, res) {
    res.sendFile(__dirname + '/public/views/ai.html');
});

app.get('/room', function(req, res) {
    res.sendFile(__dirname + '/public/views/againstOther.html');
});

/**
 * Socket io
 */
var connectionCounts = 0;
var roomId = null;
io.on('connection', function (socket) {

    connectionCounts++
    io.emit('counts', connectionCounts);

    // Join socket to random room on connect
    roomId = Math.floor(Math.random() * 99999);
    socket.join(roomId);

    // Tell the socket that it is in a room
    io.to(roomId).emit('assignRoom', roomId);

  

    //Tell socket to leave a room
    socket.on('leaveRoom', function(oldRoomId) {
        socket.leave(oldRoomId);
    });

    //Tell socket to join a room
    socket.on('joinRoom', function(newRoomId) {
        socket.join(newRoomId);
    });


    socket.on('messages', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
      connectionCounts--;
      io.sockets.emit('counts', connectionCounts);
    });

  });

server.listen(port, function() {
    console.log('Express server listening.');
});