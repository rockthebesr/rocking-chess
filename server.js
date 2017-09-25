var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

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
app.get('/', function (req, res) {
    res.render(__dirname + '/public/index');
});

app.get('/local', function (req, res) {
    res.render(__dirname + '/public/views/local');
});

app.get('/ai', function (req, res) {
    res.render(__dirname + '/public/views/ai');
});

app.get('/room', function (req, res) {
    var roomId = Math.floor(Math.random() * 99999);
    res.redirect('/room/' + roomId);
})
app.get('/:roomId', function (req, res) {
    res.render(__dirname + '/public/views/againstOther', {
        "roomId": req.params.roomId
    });
});

/**
 * Socket io
 */
var socketIdToRoom = {};
var roomCounts = {}
var roomId = null;
io.on('connection', function (socket) {


    //socket has a room id to join
    socket.on('askToJoin', function (roomId) {
        socketIdToRoom[socket.id] = roomId;
        var type;
        if (!roomCounts[roomId]) {

            socket.join(roomId);
            type = 0;
            roomCounts[roomId] = 1;
        } else if (roomCounts[roomId] == 2) {
            io.to(roomId).emit("rejected", "Room already has 2 players!");
        } else {
            socket.join(roomId);
            type = 1;
            roomCounts[roomId] += 1;
        }
        io.to(socket.id).emit('confirmJoin', {
            roomId: roomId,
            type: type
        });
        io.to(roomId).emit('roomCount', roomCounts[roomId]);
    })

    //Tell socket to leave a room
    socket.on('leaveRoom', function (oldRoomId) {
        socket.leave(oldRoomId);
    });

    //Tell socket to join a room
    socket.on('joinRoom', function (newRoomId) {
        socket.join(newRoomId);
    });

    socket.on('move', function (data) {
        var room = socketIdToRoom[socket.id]
        io.to(room).emit("move", data);
    });

    socket.on('disconnect', () => {
        var room = socketIdToRoom[socket.id];
        roomCounts[room]--;
        io.to(room).emit('roomCount', roomCounts[roomId]);
    });
});

server.listen(port, function () {
    console.log('Express server listening.');
});