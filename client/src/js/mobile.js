canvas.addEventListener("touchstart", handleStart, false);
canvas.addEventListener("touchend", handleEnd, false);
canvas.addEventListener("touchcancel", handleCancel, false);
canvas.addEventListener("touchleave", handleEnd, false);
canvas.addEventListener("touchmove", handleMove, false);

function handleStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
}
function handleMove(e){
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}
function handleCancel(e){
    var mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
}
function handleEnd(e){
    var mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
}