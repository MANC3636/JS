/* I've imported an image.   I need to be able to put it into a func, and 
to rotate the image.

also worked on colors and getting better control of squares and circle shapes*/

var canvas=document.querySelector("canvas")
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
console.log("this is canvas's width" + canvas.width)

var c=canvas.getContext('2d')//get the context funcs fm canvas

//I'm using the math.random() to randomize the x/y starting pos and the x/y velocities


//we are going to make multiple circles
function Circle(x, y, dx, dy, radius, color, strokeColor){
    this.x=x;
    this.y=y
    this.dx=dx;
    this.dy=dy;
    this.radius=radius;
    this.color=color;
    this.scolor=strokeColor

    this.draw=function(){        
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.strokeStyle=this.scolor;
        c.stroke();
        c.fillStyle=this.color
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
function Images(x, y, dx, dy, height, width, image, angle){
    this.x=x;
    this.y=y
    this.dx=dx;
    this.dy=dy;
    this.height=height;
    this.width=width;
    this.angle=angle
   

    this.draw=function(){     
        this.radians=this.angle*Math.PI/180//degrees*(pi *180)=radians
        
        //import and rotate png image
        this.image = new Image()//Image, image.src, drawimage
        this.image.src="beetle.png"
        c.save()//save, (translate), rotate & restore
        c.translate(canvas.width/2, canvas.height/2)
        c.drawImage(this.image, beetle.x, beetle.y, 50, 70)
        c.rotate(this.radians)        
        c.restore()
        
        
        }
    this.update=function(){
        //code to keep the beetle on frame
        
        this.draw()
        if (this.x>canvas.width|| this.x<0){this.dx=-this.dx}
        if (this.y>canvas.height|| this.y<0){this.dy=-this.dy}
        this.x+=this.dx;        
        this.y+=this.dy;
        
    }    
}

    
//let's make a function that can make squares; I'll make two squares.
function square (x, y, width, height, color){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.color=color;
    this.image;

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

//collision function for squares; here is where the magic happens
function collision_dect(objA, objB){
    return objA.x<objB.x+objB.width&&
           objA.x+objA.width>objB.x&&
           objA.y<objB.y+objB.height&&
           objA.y +objA.height>+objB.y;



}


//now I make my 2 squares
var square1=new square(20, 200, 50, 50, "blue")
var square2=new square(200, 200, 150, 150, "red")
var beetle=new Images(500, 400, 0,-5 , 30, 40, "beetle.png", 270)


var circleArray=[];
for (var i=0; i<5;i++){
    var radius=30
    //to prevent circles from spawning outside of viewscreen, we must account for radius
    var x=Math.random()* (innerWidth-radius*2)+radius;
    var dx=(Math.random()-.8)*8;
    var y=Math.random()* (innerHeight-radius*2)+radius;
    var dy=(Math.random()-.4)*4;
    
    circleArray.push(new Circle(x, y, dx, dy, radius, "blue", "green"))

}
console.log(circleArray)
var circle1=new Circle(200,200, 5, 3, 100, "pink", "purple");



function animate(){    
    requestAnimationFrame(animate);
    //clear the screen
    c.clearRect(0,0, canvas.width, canvas.height)//takes x, y, h, w
    
   
    //circle1.draw() //don't need draw here if we put it insicde of Cirlce's update()
    circle1.update()
    square1.update();
    square2.update();
    beetle.update()
    
    console.log(beetle.x)
    square1.x+=1;
    
    
    
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