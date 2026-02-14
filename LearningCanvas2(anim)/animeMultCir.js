

var canvas=document.querySelector("canvas")
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

var c=canvas.getContext('2d')//get the context funcs fm canvas

//I'm using the math.random() to randomize the x/y starting pos and the x/y velocities
var x=Math.random()* innerWidth;
var dx=(Math.random()-.8)*8;
var y=Math.random()* innerHeight;
var dy=(Math.random()-.4)*4;
var radius=30

//we are going to make multiple circles
function Circle(x, y, dx, dy, radius, color){
    this.x=x;
    this.y=y
    this.dx=dx;
    this.dy=dy;
    this.radius=radius;
    this.color=color
   


    this.draw=function(){        
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.strokeStyle=this.color;
        c.stroke();
        }
    this.update=function(){        

        if (this.x+this.radius>innerWidth|| this.x-this.radius<0){this.dx=-this.dx}
        if (this.y+this.radius>innerHeight|| this.y-this.radius<0){this.dy=-this.dy}

        



        this.x+=this.dx
        this.y+=this.dy;
        this.draw()
    }
    
}
var circle2=new Circle(400, 300, 4, 8, 70, "red" )
var circle1=new Circle(200,200, 5, 3, 50, "blue");
var circle3=new Circle(600,50, 5, 3, 50, "purple");

//circle1.draw()
circle2.draw()

function distance(x1, y1, x2, y2){
    var circ1X=x1
    var circ1Y=y1
    var circ2X=x2
    var circ2Y=y2
    let  Xdistance=circ2X-circ1X
    let Ydistance=circ2Y-circ1Y
    return Math.sqrt(Math.pow(Xdistance,2) + Math.pow(Ydistance,2))
}


function animate(){    
    requestAnimationFrame(animate);
    c.clearRect(0,0, canvas.width, canvas.height)//takes x, y, h, w
    //circle1.draw() //don't need this if we put it insicde of Cirlce's update()
    circle1.update()
    circle2.update()
    circle3.update()
    //this is draw circle code
    /*c.beginPath();
    c.arc(x, y, radius, 0, Math.PI*2, false);
    c.strokeStyle="blue";
    c.fillStyle="red"
    c.fill()
    c.stroke();*/
    //this is update code
    if (x+radius>innerWidth|| x-radius<0){dx=-dx}
    if (y+radius>innerHeight|| y-radius<0){dy=-dy}

    console.log(distance(circle1.x, circle1.y, circle2.x, circle2.y))
    if (distance(circle1.x, circle1.y, circle2.x, circle2.y)<circle1.radius+circle2.radius){c.fillStyle="green"; c.fill()}

    x+=dx
    y+=dy


}
animate()