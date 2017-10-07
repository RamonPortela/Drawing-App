var canvas = document.getElementById("drawing-canvas");
var context = canvas.getContext("2d");
var socket = io();

var mouseLocal = {
    click: false,
    previousX: 0,
    previousY: 0,
    currentX: 0,
    currentY: 0
}
var pathArray = [];
var mousesOnline = [];

socket.on('draw', function(data){
    
    if(data.id == socket.id){
        return;
    }
    else{

        console.log(data.path);

        context.beginPath();
        context.moveTo(data.path[0].x, data.path[0].y)
        for(var i = 1; i < data.path.length; i++){
            context.lineTo(data.path[i].x, data.path[i].y);
        }
        context.stroke();
    }
})

var line = {
    color: "black",
    size: 5
}

var draw = function(firstClick){
    setLine();
    context.beginPath();
    if(!firstClick){
        context.moveTo(mouseLocal.previousX, mouseLocal.previousY);
    }
    context.lineTo(mouseLocal.currentX, mouseLocal.currentY);
    context.closePath();
    context.stroke();
}

var setMouse = function(x, y){
    mouseLocal.previousX = mouseLocal.currentX;
    mouseLocal.previousY = mouseLocal.currentY;
    mouseLocal.currentX = x - canvas.offsetLeft;
    mouseLocal.currentY = y - canvas.offsetTop;
}

var setLine = function(newSetup){
    if(!newSetup){
        context.strokeStyle = line.color;
        context.lineWidth = line.size;
        context.lineCap = "round";
        context.lineJoin = "round";
    }
    else{
        context.strokeStyle = newSetup.color;
        context.lineWidth = newSetup.size;
        context.lineCap = "round";
        context.lineJoin = "round";
    }
}

canvas.onmousedown = function(e){
    if(e.buttons > 1){
        return;
    }
    setMouse(e.layerX, e.layerY);
    draw(true);
    socket.emit("draw", {path: pathArray, id: socket.id});
    mouseLocal.click = true;
};

canvas.onmousemove = function(e){
    if(mouseLocal.click){
        setMouse(e.layerX, e.layerY);
        draw(false);
        pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
        if(pathArray.length == 100){
            socket.emit("draw", {path: pathArray, id: socket.id});
            //console.log(pathArray);
            pathArray = pathArray.slice(99);
            //console.log(pathArray);
        }
    }
}

canvas.onmouseup = function(e){
    mouseLocal.click = false;
    console.log(pathArray);
    socket.emit("draw", {path: pathArray, id: socket.id});
    pathArray = [];
}

canvas.onmouseout = function(e){
    mouseLocal.click = false;
    console.log(pathArray);
    if(pathArray.length > 0){
        socket.emit("draw", {path: pathArray, id: socket.id});
        pathArray = [];
    }
}

console.log(canvas);