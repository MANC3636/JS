

//button to start game
var funBtn=document.getElementById("start")
funBtn.addEventListener("click", game1)





function game1(){game}//func holding the game

var game = document.addEventListener("click", ()=> {//the game
//first let's get the canvas and context
const canvas=document.querySelector("canvas") //canvas did not need an id; maybe b/s there's only one
const context=canvas.getContext("2d");

const midX=canvas.width/2
//now let's declare the ball, paddle & player & their starting values
let ball={x:midX, y:0, speedX:1, speedY: 5}//why is the ball a var, but the paddle a const?
const paddle={x:midX-50, y:canvas.height-50, len:100, direction: 0}
const player={hits:0, hightscore:0}
//let isPaused=false;

//pause funcs
//function pauseGame(){isPause=true;}
//function resumeGame(){isPause=false;}


//callback func for animation frame

const render=()=> {
    paddle.x=paddle.x+paddle.direction;
/*
    if (player.hits<10){ball.x=ball.x+ball.speedX;
    ball.y=ball.y+ball.speedY;}
    else { player.hits=5;
        ball.x=ball.x+ball.speedX;
    ball.y=ball.y+ball.speedY;    
        };
    
    

    if (ball.x <0 || ball.x > canvas.width){ball.speedX=-ball.speedX;}
    if (ball.y <0){ball.speedY=-ball.speedY;}
    if (ball.y > paddle.y){
        const isLeftOfPaddle =ball.x < paddle.x;
        const isRightOfPaddle=ball.x> paddle.x + paddle.len;
        if (isLeftOfPaddle || isRightOfPaddle){
            ball={x:midX, y:0, speedX:1, speedY: 5};
            player.hits=0;           
            
            }
        else{ball.speedY=-ball.speedY;
            const midPaddle=paddle.x+(paddle.len/2);
            ball.speedX=.1 * (ball.x-midPaddle);
            player.hits++;

            if (player.hits>player.hightscore){player.hightscore=player.hits;}
        }
    }*/
    //clear prev drawing
    context.clearRect(0,0, canvas.width, canvas.height);
    context.beginPath();

    //turning to the ball
    context.arc(ball.x, ball.y, 5, 0, Math.PI*2);

    //paddle
    context.moveTo(paddle.x, paddle.y); //wehre is paddleY defined?
    context.lineTo(paddle.x + paddle.len, paddle.y);

    //draw ball & paddle
    context.stroke();

    //draw hit count and high score
    context.font="20px sans-serif";
    context.fillText("Hits: " + player.hits, 20, paddle.y+30);
    context.fillText("High score: " + player.hightscore, canvas.width-140, player.y+30);
    

    //continue animation
    requestAnimationFrame(render);
}

//event handlers

document.addEventListener("keydown", e=>{
    if (e.code=="ArrowLeft"){paddle.direction=-5;}
    if (e.code=="ArrowRight"){paddle.direction=5;}
});

document.addEventListener("keyup", ()=> {paddle.direction=0;});
//document.addEventListener("player.hits ==2", pauseGame(), false);

requestAnimationFrame(render)


})

