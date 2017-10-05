var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

server.listen(server_port, server_ip_address);

io.on('connection', function(socket){
    socket.on('draw', function(data){
        io.emit('draw', {line: data.line});
    })
});