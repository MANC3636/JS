/* in animation, we made one cicle.  Now we are using a loop to make a lot of loops.
notice line 56 is replaced with an for loop*/

var canvas=document.querySelector("canvas")
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

var c=canvas.getContext('2d')//get the context funcs fm canvas

//I'm using the math.random() to randomize the x/y starting pos and the x/y velocities


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
        c.fill()
        }
    this.update=function(){
        
        if (this.x+this.radius>innerWidth|| this.x-this.radius<0){this.dx=-this.dx}
        if (this.y+this.radius>innerHeight|| this.y-this.radius<0){this.dy=-this.dy}

        this.x+=this.dx
        this.y+=this.dy;
        this.draw()
    }    
}






var circleArray=[];
for (var i=0; i<5;i++){
    var radius=30
    //to prevent circles from spawning outside of viewscreen, we must account for radius
    var x=Math.random()* (innerWidth-radius*2)+radius;
    var dx=(Math.random()-.8)*8;
    var y=Math.random()* (innerHeight-radius*2)+radius;
    var dy=(Math.random()-.4)*4;
    
    circleArray.push(new Circle(x, y, dx, dy, radius))

}
console.log(circleArray)
var circle1=new Circle(200,200, 5, 3, 50, "green");
circle1.draw()

function animate(){    
    requestAnimationFrame(animate);
    c.clearRect(0,0, canvas.width, canvas.height)//takes x, y, h, w
    //circle1.draw() //don't need this if we put it insicde of Cirlce's update()
    circle1.update()

for (var i=0; i<circleArray.length;i++)
{circleArray[i].update()}

    //this is draw circle code
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI*2, false);
    c.strokeStyle="blue";
    c.stroke();
    //this is update code
    if (x+radius>innerWidth|| x-radius<0){dx=-dx}
    if (y+radius>innerHeight|| y-radius<0){dy=-dy}

    x+=dx
    y+=dy


}
animate()