console.log("hello")
var canvas=document.querySelector("canvas");
var c=canvas.getContext('2d'); //context has a bunch of methods we can use to draw

/* here we cover creating the canvas, then using some of the context funcs 
to make squares, lines, and arcs/circles.  Need more study*/ 

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

//three rects; I'm having trouble controlling the color for square3

function makeSquare(x, y, w, h, color){
    c.fillRect(x, y, w, h);//this is a native func
    c.fillStyle=color;
}
//var sqare1=makeSquare(10, 10, 100, 100, "red")
//var sqare2=makeSquare(20, 20, 100, 100, "rgba(0, 255, 255, .7")
var sqare3=makeSquare(50, 50, 100, 100, "rgba(0, 255, 0, .7")

//some lines & arcs need paths

function makeLine(x1, y1, x2, y2, color){
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2)
    c.strokeStyle=color
    c.stroke() //stroke actually puts the drawing to the canvas
    
}

var line1=makeLine(20, 50, 100, 200, "red" )
var line2=makeLine(300, 50, 400, 600, 'rgba(0, 255, 0, .7)')

//creating arcs & circles
//let's make multiple arcs/circles with a for loop

for(var i=0; i<8; i++){
    var x=Math.random()*window.innerWidth;
    var y =Math.random()*window.innerHeight;
    var arcing=Math.random()*10
    
    c.beginPath()
    c.arc(x, y, 40, 0, Math.PI*arcing, false)
    //this if conditional is to randomize the color, some.
    if (x<400||x>1200){c.strokeStyle="red"}
    else c.strokeStyle="blue"

    //c.stroke()
}