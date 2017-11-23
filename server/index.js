var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var db = require('./db').MongoDb;
var webpush = require('web-push');

var server_port = process.env.PORT || 8080;
var server_ip_address = '0.0.0.0' || '127.0.0.1';
var undo = [];
var redo = [];
var currentState = null;
var usuariosOnline = 0;
var looking = 0;
var privateKey = '9tVaZvPjiw__81N1Np4oRpfc6f18GiPlAXxVNdBJDoM';
var publicKey = 'BDMGPf7SX0PcuYd_KDk1qEzpU3kE8XEw9_dq0Qwp_XtUB98SNfyHoOxjsTJIW7ItOs25nZTqQcvq6gU9TFCzCQM';
var baseUrl;

app.use('/', express.static("public"));

app.get('/api/subscription', function(req, res){
    db.getSubscriptions(function(err, subscriptions){
        if(!err){

        }
        res.json(subscriptions);
    });
})

app.post('/api/subscription', function(req, res){
    var newSub = JSON.parse(req.body);
    db.subscribe(newSub);
    response.send(req.body)
})

server.listen(server_port, server_ip_address, function(){
    db.connect();
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

    socket.on('subscription', function(data){
        if(data){
            var parsedData = JSON.parse(data.newSub);
            db.subscribe(parsedData);
        }
    });

    socket.on('draw', function(data){
        io.emit('draw', data);
        webpush.setVapidDetails('maito:ramon.santos@al.infnet.edu.br', publicKey, privateKey);
        if(data.notify){
            db.getSubscriptions(function(err, subscriptions){
                if(err){
                    //throw Error("Erro recuperando subscriptions.");
                }
                
                subscriptions.map(function(sub){
                    var pushConfig = {
                        endpoint: sub.endpoint,
                        keys: sub.keys
                    };

                    webpush.sendNotification(pushConfig, JSON.stringify({
                        title: 'Drawing-momo',
                        content: 'Alguém está desenhando',
                        data:{
                            openUrl: '/'
                        }
                    })).catch(function(err){
                        console.log(err);
                    });

                });
            });
        }
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