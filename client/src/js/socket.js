var Socket = (
    function(){
        var socket = io();

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
                    context.lineTo(data.path[0].x, data.path[0].y);
                    context.stroke();
                    return;
                }
        
                context.moveTo(data.path[0].x, data.path[0].y)
                for(var i = 1; i < data.path.length; i++){
                    context.lineTo(data.path[i].x, data.path[i].y);
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
                context.lineTo(data.path[0].x, data.path[0].y);
                context.stroke();
                return;
            }
        
            context.moveTo(data.path[0].x, data.path[0].y)
            for(var i = 1; i < data.path.length; i++){
                context.lineTo(data.path[i].x, data.path[i].y);
            }
            context.stroke();
        });

        socket.on('bucket', function(data){
            if(data.id == socket.id){
                return;
            }
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

        function reDraw(image){
            if(image == null){
                return;
            }

            context.globalCompositeOperation="source-over";
            context.clearRect(0, 0, canvas.width, canvas.height);
            var base_image = new Image();
            base_image.src = image;
            base_image.onload = function(){
              context.drawImage(base_image, 0, 0, canvas.width, canvas.height);
            }

            return true;
        }
        
        var emitLooking = function(looking){
            socket.emit("looking", {looking})
        }

        var emitDraw = function(){
            socket.emit("draw", {path: pathArray, id: socket.id, lineConfig: line});
        }
        
        var emitBorracha = function(){
            socket.emit("erase", {path: pathArray, id: socket.id});
        }

        var emitBucket = function(data){
            socket.emit('bucket', { position: data.position, clickedPixel: data.clickedPixel, selectedColor: data.selectedColor });
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

        return {
            emitLooking: emitLooking,
            emitDraw: emitDraw,
            emitBorracha: emitBorracha,
            emitBucket: emitBucket,
            emitClear, emitClear,
            emitUndo: emitUndo,
            emitRedo: emitRedo,
            emitAddUndo: emitAddUndo
        };

    }
)();

