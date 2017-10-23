canvas.addEventListener("touchstart", handleStart, false);
canvas.addEventListener("touchend", handleEnd, false);
canvas.addEventListener("touchcancel", handleCancel, false);
canvas.addEventListener("touchleave", handleEnd, false);
canvas.addEventListener("touchmove", handleMove, false);

var lastTouch = {}

function handleStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    lastTouch = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
}
function handleMove(e){
    var touch = e.touches[0];
    lastTouch = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}
function handleCancel(e){    
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mouseup", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    canvas.dispatchEvent(mouseEvent);
}
function handleEnd(e){
    console.log(e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mouseup", {
        clientX: lastTouch.clientX,
        clientY: lastTouch.clientY
      });
    canvas.dispatchEvent(mouseEvent);
}