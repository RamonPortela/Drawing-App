var socket = io();

socket.on('draw', function(data){
    context.globalCompositeOperation="source-over";
    if(data.id == socket.id){
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

var emitDraw = function(){
    socket.emit("draw", {path: pathArray, id: socket.id, lineConfig: line});
}

var emitBorracha = function(){
    socket.emit("erase", {path: pathArray, id: socket.id})
}