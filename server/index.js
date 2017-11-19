var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');

var server_port = process.env.PORT || 8080;
var server_ip_address = '0.0.0.0' || '127.0.0.1';
var undo = [];
var redo = [];
var currentState = null;
var usuariosOnline = 0;
var looking = 0;

app.use('/', express.static("public"));

server.listen(server_port, server_ip_address, function(){

});

io.on('connection', function(socket){
    usuariosOnline++;

    io.emit('userChanged', usuariosOnline);
    socket.emit('getCurrentDrawing', {image: currentState});

    socket.on('disconnect', function(){
        usuariosOnline--;
        looking--;
        io.emit('updateLooking', looking);
        io.emit('userChanged', usuariosOnline);
    });

    socket.on('getCurrentDrawing', function(){
        socket.emit('getCurrentDrawing', {image: currentState});
    })

    socket.on('looking', function(isLooking){
        if(isLooking.looking)
            looking++;
        else
            looking--;

        io.emit('updateLooking', looking);
    });

    socket.on('draw', function(data){
        io.emit('draw', data);
    });

    socket.on('erase', function(data){
        io.emit('erase', data);
    });

    socket.on('bucket', function(data){
        data.id = socket.id;
        io.emit('bucket', data)
    })

    socket.on('clear', function(){
        io.emit('clear');
    });

    socket.on('undo', function(){
        if(undo.length < 1){
            io.emit('undo', {image: null});
            return;
        }
        io.emit('undo', {image: undo[undo.length-1]});
        redo.push(currentState);
        currentState = undo.pop();
    });

    socket.on('addUndo', function(data){
        var images = data.image;
        if(undo.length < 5){
            undo.push(images.before);
        }
        else{
            undo = undo.slice(1);
            undo.push(images.before);
        }
        currentState = images.current;
        redo = [];
    });

    socket.on('redo', function(){
        if(redo.length < 1){
            io.emit('redo', {image: null});
            return;
        }
        io.emit('redo', {image: redo[redo.length-1]});
        undo.push(currentState);
        currentState = redo.pop();
    });

});