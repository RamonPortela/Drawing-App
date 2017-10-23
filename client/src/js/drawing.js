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

var line = {
    size: 5,
    rgba: getCurrentColorRGBA(colorInput.value),
    color: null
}

line.color = "RGBA("+ line.rgba.r +", "+line.rgba.g +", "+line.rgba.b+", "+line.rgba.a+")"

function getCurrentColorRGBA(color){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)){
        c= color.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return {
            r: (c>>16)&255,
            g: (c>>8)&255,
            b: c&255,
            a: 255
        }
    }
    throw new Error('Bad Hex');
}

mouseLocal.setCursor();


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
            context.globalCompositeOperation="source-over";
            console.log(mouseLocal.currentX, mouseLocal.currentY)
            var position = [mouseLocal.currentX, mouseLocal.currentY];
            var clickedPixel = context.getImageData(mouseLocal.currentX, mouseLocal.currentY, 1, 1).data;
            var selectedColor = line.rgba;
            console.log('bucket');
            console.log(position);
            floodFill(position, clickedPixel, selectedColor);
            break;
        case "picker":
            var pixel = context.getImageData(mouseLocal.currentX, mouseLocal.currentY, 1, 1).data;
            line.rgba = {
                r: pixel[0],
                g: pixel[1],
                b: pixel[2],
                a: pixel[3]
            }
            line.color = colorDiv.style.backgroundColor = "RGBA("+pixel[0]+", "+pixel[1]+", "+pixel[2]+", 255)";            
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
    var rgbaColor = getCurrentColorRGBA(colorInput.value);
    line.rgba = rgbaColor;
    line.color = "RGBA("+ rgbaColor.r +", "+rgbaColor.g +", "+rgbaColor.b+", "+rgbaColor.a+")";
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

btnBucket.onclick = function(e){
    mouseLocal.pincel = "bucket";
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
    if(mouseLocal.pincel == "bucket"){
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
    console.log('mouseup'); 
    console.log(e);

    if(mouseLocal.pincel == "bucket"){
        console.log('oi');
        setMouse(e.clientX, e.clientY);
        drawing.before = canvas.toDataURL('image/png');
        draw();
        drawing.current = canvas.toDataURL('image/png');
        Socket.emitAddUndo(drawing);
        emitAction();
    }
    else
    {       
        mouseLocal.newClick = true;
        drawing.current = canvas.toDataURL('image/png');
        Socket.emitAddUndo(drawing);
        mouseLocal.click = false;
        emitAction();
        pathArray = [];
    }
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

function floodFill(position, clickedPixel, selectedColor){
    var clickedColor = {
        r: clickedPixel[0],
        g: clickedPixel[1],
        b: clickedPixel[2],
        a: clickedPixel[3]
    };
    if(clickedColor.r == selectedColor.r && clickedColor.g == selectedColor.g && clickedColor.b == selectedColor.b && clickedColor.a == selectedColor.a){
        return;
    }

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var tolerance;

    var pixelStack = [];
    pixelStack.push([position[0], position[1]]);

    function verificarCor(position, clickedColor){
        var positionColor = {
            r: data[position],
            g: data[position + 1],
            b: data[position + 2],
            a: data[position + 3]
        }

        if(positionColor.r == selectedColor.r && positionColor.g == selectedColor.g && positionColor.b == selectedColor.b && positionColor.a == selectedColor.a){
            return false;
        }

        var hsp = Math.sqrt(
            0.299 * (selectedColor.r * selectedColor.r) +
            0.587 * (selectedColor.g * selectedColor.g) +
            0.114 * (selectedColor.b * selectedColor.b)
        );

        if(hsp>200){
            tolerance = 20;
        }
        else{
            if(hsp > 85){
                tolerance = 175
            }
            else{
                tolerance = 250;
            }
        }

        if(
            Math.abs(positionColor.r - clickedColor.r)<=tolerance &&
            Math.abs(positionColor.g - clickedColor.g)<=tolerance &&
            Math.abs(positionColor.b - clickedColor.b)<=tolerance &&
            Math.abs(positionColor.a - clickedColor.a)<=tolerance)
        return true;

        else
            return false;
    }

    function pintarPixel(position){
        data[position] = selectedColor.r;
        data[position + 1] = selectedColor.g;
        data[position + 2] = selectedColor.b;
        data[position + 3] = selectedColor.a;
    }
    while(pixelStack.length){
        if(pixelStack.length > 100)
        break;
        var newPos, x, y, pixelPosition, reachLeft, reachRight;
        
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        pixelPosition = (y * canvas.width + x) * 4;

        while(y >= 0 && verificarCor(pixelPosition, clickedColor)){
            pixelPosition -= canvas.width * 4;
            y--;
        }

        pixelPosition += canvas.width * 4;
        y++;
        reachLeft = false;
        reachRight = false;

        while(y < canvas.height && verificarCor(pixelPosition, clickedColor)){
            pintarPixel(pixelPosition);

            if(x > 0){
                if(verificarCor(pixelPosition - 4, clickedColor)){
                    if(!reachLeft){
                        pixelStack.push([x - 1, y])
                        reachLeft = true;
                    }
                }
                else{
                    if(reachLeft){
                        reachLeft = false;
                    }
                }
            }

            if(x < canvas.width - 1){
                if(verificarCor(pixelPosition + 4, clickedColor)){
                    if(!reachRight){
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                }
                else{
                    if(reachRight){
                        reachRight = false;
                    }
                }
            }

            pixelPosition += canvas.width * 4;
            y++;

        }
    }
    context.putImageData(imageData, 0, 0);
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
            var position = [mouseLocal.currentX, mouseLocal.currentY];
            var clickedPixel = context.getImageData(mouseLocal.currentX, mouseLocal.currentY, 1, 1).data;
            var selectedColor = line.rgba;
            var data = {
                position: position,
                clickedPixel: clickedPixel,
                selectedColor: selectedColor
            }
            Socket.emitBucket(data);
            break;
    }
}