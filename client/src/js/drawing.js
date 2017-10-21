var canvas = document.getElementById("drawing-canvas");
var context = canvas.getContext("2d");
var colorInput = document.getElementById("color-input");
var btnLimpar = document.getElementById("btn-limpar");
var btnPincel = document.getElementById("btn-pincel");
var btnBorracha = document.getElementById("btn-borracha");
var btnBucket = document.getElementById("btn-bucket");
var btnColorPicker = document.getElementById("btn-color-picker");
var colorDiv = document.getElementById("color-div");
var btnTamanhos = document.querySelectorAll("[id*='div-tamanho-']");
var divOpcoes = document.getElementById("opcoes-div");
var btnUndo = document.getElementById("btn-undo");
var btnRedo = document.getElementById("btn-redo");
var onlineCounter = document.getElementById("online-counter");
var visualizandoCounter = document.getElementById("visualizando-counter");

var drawing = {
    current: null,
    before: null
};

window.onload = function(e){
    colorInput.remove();

    if(document.hidden){
        Socket.emitLooking(false);
    }
    else{
        Socket.emitLooking(true);
    }
}

window.onfocus = function(e){
    Socket.emitLooking(true);
}

window.onblur = function(e){
    Socket.emitLooking(false);
}

colorDiv.style.backgroundColor = colorInput.value;

(
    function(){
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

        var matriz = [];

        var linhaMatriz = [];

        console.log(imageData);
    }
)();

var mouseLocal = {
    click: false,
    newClick: true,
    previousX: 0,
    previousY: 0,
    currentX: 0,
    currentY: 0,
    pincel: "pincel",
    setCursor: function(){
        switch(this.pincel){
            case "pincel":
            case "borracha":
                canvas.style.cursor = 'url("../../src/img/cursores/'+ line.size + 'px.png' +'")' + line.size /2 + ' ' + line.size/2+',default';
                break;
            case "picker":
                canvas.style.cursor = 'url("../../src/img/cursores/picker.png") 0 16,default';
                break;
        }
    }
}

var pathArray = [];
var mousesOnline = [];
var inicioClick = 0;

var line = {
    color: colorInput.value,
    size: 5
}

mouseLocal.setCursor();

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
    
    switch(mouseLocal.pincel){
        case "pincel":
            setLine();
            context.beginPath();
            context.globalCompositeOperation="source-over";
            if(!firstClick){
                context.moveTo(mouseLocal.previousX, mouseLocal.previousY);
            }
            context.lineTo(mouseLocal.currentX, mouseLocal.currentY);
            context.stroke();
            break;
        case "borracha":
            setLine();
            context.beginPath();
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
        case "picker":
            var pixel = context.getImageData(mouseLocal.currentX, mouseLocal.currentY, 1, 1).data;
            line.color = colorDiv.style.backgroundColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";            
            btnPincel.click();
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

btnTamanhos.forEach(function(element, index){
    element.onclick = function(e){
        line.size = (index+1) * 5;
        mouseLocal.setCursor();

        var target = e.target.id == "" ? e.target : e.target.childNodes[0];
        setSelection(target, "[class*='div-tamanho-']");
    };
});

colorInput.onchange = function(e){
    line.color = colorInput.value;
    colorDiv.style.backgroundColor = colorInput.value;
}
btnLimpar.onclick = function(e){
    Socket.emitClear();
}
btnBorracha.onclick = function(e){
    mouseLocal.pincel = "borracha";
    mouseLocal.setCursor();

    var target = e.target.tagName == "SPAN" ? e.target.parentElement : e.target;
    abrirOpcoes();
    setSelection(target, ".ferramenta");    
}

btnPincel.onclick = function(e){
    mouseLocal.pincel = "pincel";
    mouseLocal.setCursor();

    var target = e.target.tagName == "SPAN" ? e.target.parentElement : e.target;
    abrirOpcoes();
    setSelection(target, ".ferramenta");    
}

btnColorPicker.onclick = function(e){
    mouseLocal.pincel = "picker"; 
    mouseLocal.setCursor();

    var target = e.target.tagName == "SPAN" ? e.target.parentElement : e.target;
    fecharOpcoes();
    setSelection(target, ".ferramenta");    
}

btnUndo.onclick = function(e){
    Socket.emitUndo();
}

btnRedo.onclick = function(e){
    Socket.emitRedo();
}

function setSelection(target, classe){
    removeSelectedClass(classe);
    target.classList.add("selected");
}

function removeSelectedClass(classe){
    var ferramentas = document.querySelectorAll(classe);
    for(var i = 0; i < ferramentas.length; i++){
        ferramentas[i].classList.remove("selected");
    }
}

function abrirOpcoes(){    
    divOpcoes.firstElementChild.style.opacity = 1;
    divOpcoes.firstElementChild.style.visibility = 'visible';
    divOpcoes.style.width = '100px';
}

function fecharOpcoes(){    
    divOpcoes.firstElementChild.style.opacity = 0;
    divOpcoes.firstElementChild.style.visibility = 'hidden';
    divOpcoes.style.width = 0;
}

colorDiv.onclick = function(e){
    colorInput.click();
}

canvas.onmousedown = function(e){
    e.preventDefault();
    if(mouseLocal.newClick){
        drawing.before = canvas.toDataURL('image/png');
    }
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
    if(mouseLocal.pincel == "picker" || mouseLocal.pincel == "bucket"){
        return; 
    }

    if(mouseLocal.click){
        setMouse(e.clientX, e.clientY);
        draw(false);
        pathArray.push({x: mouseLocal.currentX, y: mouseLocal.currentY});
        if(pathArray.length == 50){
            emitAction();
            pathArray = pathArray.slice(49);
        }
    }
}

window.onmouseup = function(e){
    if(e.target == canvas){
        e.stopPropagation();
        var event = new MouseEvent('mouseup', {clientX: e.clientX, clientY: e.clientY});
        canvas.dispatchEvent(event);
    }
    else{
        mouseLocal.click = false;
        mouseLocal.newClick = true;
    }
}

canvas.onmouseup = function(e){
    e.stopPropagation();
    mouseLocal.newClick = true;
    drawing.current = canvas.toDataURL('image/png');
    Socket.emitAddUndo(drawing);
    mouseLocal.click = false;
    emitAction();
    pathArray = [];
}

canvas.onmouseout = function(e){
    if(pathArray.length > 0){
        emitAction();
        pathArray = [];
    }
}

canvas.onmouseenter = function(e){
    if(mouseLocal.click){
        mouseLocal.newClick = false;
        var event = new MouseEvent('mousedown', {clientX: e.clientX, clientY: e.clientY});
        canvas.dispatchEvent(event);
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
            Socket.emitDraw();
            break;
        case "borracha":
            Socket.emitBorracha();
            break;
        case "bucket":
            //to do
            break;
    }
}