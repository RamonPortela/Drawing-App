var canvas = document.getElementById("drawing-canvas");
var context = canvas.getContext("2d");
var colorInput = document.getElementById("color-input");
var btnLimpar = document.getElementById("btn-limpar");
var btnPincel = document.getElementById("btn-pincel");
var btnBorracha = document.getElementById("btn-borracha");
var btnBucket = document.getElementById("btn-bucket");
var btnColorPicker = document.getElementById("btn-color-picker");
var colorDiv = document.getElementById("color-div");

window.onload = function(e){
    colorInput.remove();
}

colorDiv.style.backgroundColor = colorInput.value;

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
    color: colorInput.value,
    size: 5
}

function getCurrentColorRGBA(){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(line.color)){
        c= line.color.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return {
            r: (c>>16)&255,
            g: (c>>8)&255,
            b: c&255
        }
    }
    throw new Error('Bad Hex');
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
        case "bucket":
            console.log("bucket");
            fill(line.color);
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
    colorDiv.style.backgroundColor = colorInput.value;
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
// btnBucket.onclick = function(e){
//     mouseLocal.pincel = "bucket";
// }
btnColorPicker.onclick = function(e){
    mouseLocal.pincel = "picker";
}

colorDiv.onclick = function(e){
    colorInput.click();
}

canvas.onmousedown = function(e){
    e.preventDefault();
    if(e.buttons > 1){
        return;
    }
    setMouse(e.clientX, e.clientY);
    draw(true);
    pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
    emitAction();
    mouseLocal.click = true;
};

canvas.onmousemove = function(e){
    if(mouseLocal.click){
        setMouse(e.clientX, e.clientY);
        draw(false);
        pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
        if(pathArray.length == 100){
            emitAction();
            pathArray = pathArray.slice(99);
        }
    }
}

canvas.onmouseup = function(e){
    mouseLocal.click = false;
    emitAction();
    pathArray = [];
}

canvas.onmouseout = function(e){
    mouseLocal.click = false;
    if(pathArray.length > 0){
        emitAction();
        pathArray = [];
    }
}

function fill(newColor){
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = colorLayer = context.getImageData(0,0,canvasWidth,canvasHeight);


    pixelStack = [[mouseLocal.currentX, mouseLocal.currentY]];
    
    while(pixelStack.length)
    {
      var newPos, x, y, pixelPos, reachLeft, reachRight;
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];
      
      pixelPos = (y*canvasWidth + x) * 4;
      while(y-- >= 0 && matchStartColor(pixelPos))
      {
        pixelPos -= canvasWidth * 4;
      }
      pixelPos += canvasWidth * 4;
      ++y;
      reachLeft = false;
      reachRight = false;
      while(y++ < canvasHeight-1 && matchStartColor(pixelPos))
      {
        colorPixel(pixelPos);
    
        if(x > 0)
        {
          if(matchStartColor(pixelPos - 4))
          {
            if(!reachLeft){
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          }
          else if(reachLeft)
          {
            reachLeft = false;
          }
        }
        
        if(x < canvasWidth-1)
        {
          if(matchStartColor(pixelPos + 4))
          {
            if(!reachRight)
            {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          }
          else if(reachRight)
          {
            reachRight = false;
          }
        }
                
        pixelPos += canvasWidth * 4;
      }
    }
    context.putImageData(colorLayer, 0, 0);
      
    function matchStartColor(pixelPos)
    {
        var rgb = getCurrentColorRGBA();
      var r = colorLayer.data[pixelPos];	
      var g = colorLayer.data[pixelPos+1];	
      var b = colorLayer.data[pixelPos+2];
    
      return (r == rgb.r && g == rgb.g && b == rgb.b);
    }
    
    function colorPixel(pixelPos)
    {
        var rgb = getCurrentColorRGBA();
      colorLayer.data[pixelPos] = rgb.r;
      colorLayer.data[pixelPos+1] = rgb.g;
      colorLayer.data[pixelPos+2] = rgb.b;
      colorLayer.data[pixelPos+3] = 255;
    }

}

function emitAction(){
    switch(mouseLocal.pincel){
        case "pincel":
            emitDraw();
            break;
        case "borracha":
            emitBorracha();
            break;
        case "bucket":
            //to do
            break;
        case "picker":
            //to do
            break;
    }
}