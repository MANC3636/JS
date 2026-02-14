import { ball_mvt } from "./ball_movement.js";

document.addEventListener("DOMContentLoaded", ()=> {
//first let's get the canvas and context
const canvas=document.querySelector("canvas") //canvas did not need an id; maybe b/s there's only one
const context=canvas.getContext("2d");

const midX=canvas.width/2
//now let's declare the ball, paddle & player & their starting values
let ball={x:midX, y:0, speedX:1, speedY: 5}//why is the ball a var, but the paddle a const?
const paddle={x:midX-50, y:canvas.height-50, len:100, direction: 0}
const player={hits:0, hightscore:0}
let isPaused=false;
var info_to_player=document.getElementById("info")

//pause funcs
function pauseGame(){isPause=true;}
function resumeGame(){isPause=false;}


//callback func for animation frame

const render=()=> {
    
    paddle.x=paddle.x+paddle.direction;

    if (player.hits<2){
        ball_mvt(ball, paddle, player, midX)
        ball.x=ball.x+ball.speedX;
        ball.y=ball.y+ball.speedY;}
    else { player.hits=5;
        info_to_player.innerHTML="Game Paused; answer questions to the right";
        ball_mvt(ball.y=0, paddle, player, midX);        
        ball.x=ball.x+ball.speedX;
        ball.y=ball.y+ball.speedY;    
    };
    
    
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