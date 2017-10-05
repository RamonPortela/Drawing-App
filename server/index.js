var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

io.on('connection', function(socket){
    socket.on('draw', function(data){
        io.emit('draw', {line: data.line});
    })
});