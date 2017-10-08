var canvas = document.getElementById("drawing-canvas");
var context = canvas.getContext("2d");
var colorInput = document.getElementById("color-input");
var btnLimpar = document.getElementById("btn-limpar");
var btnPincel = document.getElementById("pincel");
var btnBorracha = document.getElementById("borracha");

var mouseLocal = {
    click: false,
    previousX: 0,
    previousY: 0,
    currentX: 0,
    currentY: 0,
    pincel: "pincel"
}
var pathArray = [];
var mousesOnline = [];
var inicioClick = 0;

var line = {
    color: "black",
    size: 5
}

var draw = function(firstClick){
    setLine();
    context.beginPath();

    switch(mouseLocal.pincel){
        case "pincel":
            context.globalCompositeOperation="source-over";
            if(!firstClick){
                context.moveTo(mouseLocal.previousX, mouseLocal.previousY);
            }
            context.lineTo(mouseLocal.currentX, mouseLocal.currentY);
            context.stroke();
            break;
        case "borracha":
            context.lineWidth = line.size * 5;
            context.globalCompositeOperation="destination-out";
            if(!firstClick){
                context.moveTo(mouseLocal.previousX, mouseLocal.previousY);
            }
            context.lineTo(mouseLocal.currentX, mouseLocal.currentY);
            context.stroke();
            break;
    }
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



colorInput.onchange = function(e){
    line.color = colorInput.value;
}

btnLimpar.onclick = function(e){
    socket.emit("clear");
}

btnBorracha.onclick = function(e){
    mouseLocal.pincel = "borracha";
}

btnPincel.onclick = function(e){
    mouseLocal.pincel = "pincel";
}

canvas.onmousedown = function(e){
    e.preventDefault();
    if(e.buttons > 1){
        return;
    }
    setMouse(e.clientX, e.clientY);
    draw(true);
    pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
    switch(mouseLocal.pincel){
        case "pincel":
            emitDraw();
            break;
        case "borracha":
            emitBorracha();
            break;
    }
    mouseLocal.click = true;
};

canvas.onmousemove = function(e){
    if(mouseLocal.click){
        setMouse(e.clientX, e.clientY);
        draw(false);
        pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
        if(pathArray.length == 100){
            switch(mouseLocal.pincel){
                case "pincel":
                    emitDraw();
                    break;
                case "borracha":
                    emitBorracha();
                    break;
            }
            pathArray = pathArray.slice(99);
        }
    }
}

canvas.onmouseup = function(e){
    mouseLocal.click = false;
    switch(mouseLocal.pincel){
        case "pincel":
            emitDraw();
            break;
        case "borracha":
            emitBorracha();
            break;
    }
    pathArray = [];
}

canvas.onmouseout = function(e){
    mouseLocal.click = false;
    if(pathArray.length > 0){
        switch(mouseLocal.pincel){
            case "pincel":
                emitDraw();
                break;
            case "borracha":
                emitBorracha();
                break;
        }
        pathArray = [];
    }
}