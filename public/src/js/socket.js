var Socket = (
    function(){
        var socket = io();
        var notificar = true;
        var ultimaNotifacao = new Date;

        var public = {};

        socket.on('userChanged', function(data){
            onlineCounter.innerText = data;
        });

        socket.on('updateLooking', function(data){
            visualizandoCounter.innerHTML = data;
        })
        
        socket.on('draw', function(data){
            context.globalCompositeOperation="source-over";
            if(data.id == socket.id){
                return;
            }
        
            if(data.path.length < 1){
                return;
            }
            else{
        
                setLine(data.lineConfig);
                context.beginPath();
        
                if(data.path.length == 1){
                    context.lineTo(data.path[0].x * canvas.width, data.path[0].y * canvas.height);
                    context.stroke();
                    return;
                }
        
                context.moveTo(data.path[0].x * canvas.width, data.path[0].y * canvas.height)
                for(var i = 1; i < data.path.length; i++){
                    context.lineTo(data.path[i].x * canvas.width, data.path[i].y * canvas.height);
                }
                context.stroke();
            }
        });
            
        socket.on('clear', function(){
            context.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        socket.on('erase', function(data){
            if(data.id == socket.id){
                return;
            }
            context.lineWidth = line.size * 5;
            context.globalCompositeOperation="destination-out";
            context.beginPath();
            if(data.path.length == 1){
                context.lineTo(data.path[0].x * canvas.width, data.path[0].y * canvas.height);
                context.stroke();
                return;
            }
        
            context.moveTo(data.path[0].x * canvas.width, data.path[0].y * canvas.height)
            for(var i = 1; i < data.path.length; i++){
                context.lineTo(data.path[i].x * canvas.width, data.path[i].y * canvas.height);
            }
            context.stroke();
        });

        socket.on('bucket', function(data){
            if(data.id == socket.id){
                return;
            }
            console.log(data);
            data.position[0] = data.position[0] / data.canvasData[0];
            data.position[1] = data.position[1] / data.canvasData[1];
            data.position[0] = data.position[0] * canvas.width
            data.position[1] = data.position[1] * canvas.height
            data.clickedPixel = context.getImageData(data.position[0], data.position[1], 1, 1).data;
            floodFill(data.position, data.clickedPixel, data.selectedColor)
        })

        socket.on('getCurrentDrawing', function(data){
            if(!reDraw(data.image))
                return null;
        });

        socket.on('undo', function(data){
            if(!reDraw(data.image))
            return null;
        });

        socket.on('redo', function(data){
            if(!reDraw(data.image))
            return null;
        });

        socket.on('getImages', function(data){
            data.map(function(image){
                bases.push(image);
            });

            appendImages();
        })

        function reDraw(image){
            if(image == null){
                return;
            }

            context.globalCompositeOperation="source-over";
            context.clearRect(0, 0, canvas.width, canvas.height);
            var base_image = new Image();
            base_image.src = image;
            base_image.onload = function(){
                var ratio = window.devicePixelRatio;
              context.drawImage(base_image, 0, 0, canvas.width / ratio, canvas.height / ratio);
            }

            return true;
        }
        
        var emitLooking = function(looking){
            socket.emit("looking", {looking})
        }

        var emitDraw = function(){
            socket.emit("draw", {path: pathArray, id: socket.id, lineConfig: line, notify: notificar});
            if(notificar){
                notificar = false;
                ultimaNotifacao = Date.now();
            }
            else{
                var data = Date.now();
                if(data - ultimaNotifacao >= 1000*60*3)
                    notificar = true;
            }
        }
        
        var emitBorracha = function(){
            socket.emit("erase", {path: pathArray, id: socket.id});
        }

        var emitBucket = function(data){
            console.log(data);
            socket.emit('bucket', { position: data.position, clickedPixel: data.clickedPixel, selectedColor: data.selectedColor, canvasData: [canvas.width, canvas.height] });
        }

        var emitClear = function(){
            socket.emit('clear');
        }

        var emitUndo = function(){            
            socket.emit("undo")
        }

        var emitRedo = function(){
            socket.emit("redo");
        }

        var emitAddUndo = function(image){
            socket.emit("addUndo", {image})
        }
        
        var emitGetCurrentDrawing = function(){
            socket.emit("getCurrentDrawing");
        }

        var emitSubscription = function(newSub){
            socket.emit("subscription", {newSub});
        }


        return {
            emitLooking: emitLooking,
            emitDraw: emitDraw,
            emitBorracha: emitBorracha,
            emitBucket: emitBucket,
            emitClear, emitClear,
            emitUndo: emitUndo,
            emitRedo: emitRedo,
            emitAddUndo: emitAddUndo,
            emitGetCurrentDrawing: emitGetCurrentDrawing,
            emitSubscription: emitSubscription
        };

    }
)();

