var canvas = document.getElementById("drawing-canvas");
var context = canvas.getContext("2d");
var socket = io('http://localhost');

socket.on('draw', function(data){
    var newLine = data.line;
    mouse.previousX = newLine.previous.x;
    mouse.previousY = newLine.previous.y;
    mouse.currentX = newLine.current.x;
    mouse.currentY = newLine.current.y;

    draw(newLine.firstClick, true);
})

var line ={
    color: "black",
    size: 5
}

var mouse = {
    click: false,
    previousX: 0,
    previousY: 0,
    currentX: 0,
    currentY: 0
}

var draw = function(firstClick, fromSocket){
    setLine();
    context.beginPath();
    if(!firstClick){
        context.moveTo(mouse.previousX, mouse.previousY);
    }
    context.lineTo(mouse.currentX, mouse.currentY);
    context.closePath();
    context.stroke();

    if(!fromSocket){
        socket.emit('draw', 
            {
                line: {
                    current: {
                        x: mouse.currentX,
                        y: mouse.currentY
                    },
                    previous: {
                        x: mouse.previousX,
                        y: mouse.previousY
                    },
                    firstClick: firstClick
                }
                
            }
        );
    }
}

var setMouse = function(x, y){
    mouse.previousX = mouse.currentX;
    mouse.previousY = mouse.currentY;
    mouse.currentX = x - canvas.offsetLeft;
    mouse.currentY = y - canvas.offsetTop;
}

var setLine = function(){
    context.strokeStyle = line.color;
    context.lineWidth = line.size;
    context.lineCap = "round";
    context.lineJoin = "round";
}

canvas.onmousedown = function(e){
    setMouse(e.layerX, e.layerY);
    draw(true);
    mouse.click = true;
};

canvas.onmousemove = function(e){

    if(mouse.click){
        setMouse(e.layerX, e.layerY);
        draw();
    }
}

canvas.onmouseup = function(e){
    mouse.click = false;
}

canvas.onmouseout = function(e){
    mouse.click = false;
}

console.log(canvas);