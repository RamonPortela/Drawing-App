var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = '0.0.0.0' || '127.0.0.1';

app.use(express.static("client"));

server.listen(server_port, server_ip_address, function(){
    console.log("Listening on " + server_ip_address + ", server_port " + server_port)
  });

io.on('connection', function(socket){
    console.log('connected');
    socket.on('draw', function(data){
        io.emit('draw', {line: data.line});
    })
});