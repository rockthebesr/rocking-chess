var socket = io();
var thisRoomId = null;

socket.on('assignRoom', function (roomId) {
    thisRoomId = roomId;
    console.log(thisRoomId);
    $('#roomId').text(thisRoomId);
    socket.emit('join', 'Hello server from client');
});