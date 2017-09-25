var socket = io();
var color;
socket.emit('askToJoin', roomId);
socket.on("rejected", function (msg) {
    alert(msg);
});

socket.on('confirmJoin', function (data) {
    $('#roomId').text(data.roomId);
    if (data.type == 0) {
        color = "w";
        $("#type").text("You are playing white" );
    } else {
        color = "b";
        $("#type").text("You are playing black" );
    }
});

socket.on('roomCount', function (count) {
    if (count == null) return;
    var msg = count == 1 ? " person in the room" : " people in the room";
    $("#roomCount").text(count.toString() + msg);
});

var board,
    game = new Chess();

/* board visualization and games state handling */

var onDragStart = function (source, piece, position, orientation) {
    var currentColor = piece? piece[0]: "";
    if (currentColor != color) {
        return;
    }
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

var onDrop = function (source, target, piece) {

    var currentColor = piece? piece[0]: "";
    if (currentColor != color) {
        return;
    }

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    renderMoveHistory(game.history());
    socket.emit("move", {color: color, source: source, target: target});
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function (square, piece) {
    var currentColor = piece? piece[0]: "";
    if (currentColor != color) {
        return;
    }
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};

var removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var cfg = {
    draggable: true,
    position: 'start',
    // onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);

socket.on("move", function(data){
    var currentColor = data.color[0];
    if (currentColor == color) return;
    var move = game.move({
        from: data.source,
        to: data.target,
        promotion: 'q'
    });

    removeGreySquares();

    if (move === null) {
        return 'snapback';
    }

    board.position(game.fen());
    renderMoveHistory(game.history());
})