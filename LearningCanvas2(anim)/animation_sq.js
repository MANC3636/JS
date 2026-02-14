/* in animation, we are doing rectangle collision detection.
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

    
    //code for imported image; how to put this into a func or "class"
var spriteObj={x:0, y:0, width:50, height:50}
var beetle=Object.create(spriteObj)
beetle.x=300
beetle.y=250

var image1 = new Image()
image1.src="beetle.png"

      




//let's make a function that can make squares; I'll make two squares.
function square ( x, y, width, height, color    ){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.color=color;



    this.draw=function(){
        c.beginPath();//put pen to paper
        c.rect(this.x, this.y, this.width, this.height);//draw the square
        c.fillStyle=this.color;//set color
        c.fill();//color it in
        c.closePath();//pick up the pen
    }

    this.update=function(){
        this.draw();
    }
}

//collision function; here is where the magic happens
function collision_dect(objA, objB){
    return objA.x<objB.x+objB.width&&
           objA.x+objA.width>objB.x&&
           objA.y<objB.y+objB.height&&
           objA.y +objA.height>+objB.y;



}


//now I make my 2 squares
var square1=new square(20, 200, 50, 50, "blue")
var square2=new square(200, 200, 150, 150, "red")


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
    //will use draw image to draw the image (here a beetle)   
   
    c.drawImage(image1, beetle.x, beetle.y, 80,68)


   
    //circle1.draw() //don't need this if we put it insicde of Cirlce's update()
    circle1.update()
    square1.update();
    beetle.rot
    beetle.x+=1
    square1.x+=1;
    
    
    square2.update();
    if(collision_dect(square1, square2)){square1.color="green"}


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