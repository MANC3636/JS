
import {username, num1, num2, num3, num4, num5, num6, input1, input2, input3} from "./helper.js";

//button to start game
var funBtn=document.getElementById("start")
funBtn.addEventListener("click", game1)

function ball_mvt(ball, paddle, player, midX){

    if (ball.x <0 || ball.x > canvas.width){ball.speedX=-ball.speedX;}
    if (ball.y <0){ball.speedY=-ball.speedY;}
    if (ball.y > paddle.y){
        const isLeftOfPaddle =ball.x < paddle.x;
        const isRightOfPaddle=ball.x> paddle.x + paddle.len;
        if (isLeftOfPaddle || isRightOfPaddle){
            ball.x=midX; ball.y=0; ball.speedX=1, ball.speedY= 5;
            player.hits=0;          
            }
        else{ball.speedY=-ball.speedY;
            const midPaddle=paddle.x+(paddle.len/2);
            ball.speedX=.1 * (ball.x-midPaddle);
            player.hits++;

            if (player.hits>player.hightscore){player.hightscore=player.hits;}
        }

}}


const button1=document.getElementById("mysubmit1");
const button2=document.getElementById("mysubmit2");
const button3=document.getElementById("mysubmit3");
const Response1=document.getElementById("response1");
const Response2=document.getElementById("response2");
const Response3=document.getElementById("response3");
var ans1=document.getElementById("input1")
var ans2=document.getElementById("input2")
var ans3=document.getElementById("input3")
var correct_count=0;

//odd syntax to get the value
function getting_right_ans(button, ans, numA, numB, response){
        
        button.addEventListener('click', function(){   
    
    if (ans.value==numA*numB){response.innerHTML="that is the correct answer";
        correct_count++;
        console.log(correct_count)
        if (correct_count==3){funBtn.style.display="inline";
            info_to_player.innerHTML=" Refresh page, and play More!!";
        }
            }
    else{response.innerHTML="try adding on paper";}
        
})}


var r_w1=getting_right_ans(button1, ans1, num1, num2, Response1)
var r_w2=getting_right_ans(button2, ans2, num3, num4, Response2)
var r_w3=getting_right_ans(button3, ans3, num5, num6, Response3)


function game1(){game();
    funBtn.style.display="none"}//func holding the game

function game () {//the game
//first let's get the canvas and context
const canvas=document.querySelector("canvas") //canvas did not need an id; maybe b/s there's only one
const context=canvas.getContext("2d");

const midX=canvas.width/2
//now let's declare the ball, paddle & player & their starting values
let ball={x:midX, y:0, speedX:1, speedY: 5}//why is the ball a var, but the paddle a const?
const paddle={x:midX-50, y:canvas.height-50, len:100, direction: 0}
const player={hits:0, hightscore:0}
var info_to_player=document.getElementById("info")

//callback func for animation frame

const render=()=> {
    paddle.x=paddle.x+paddle.direction;

    if (player.hits<4){
        ball_mvt(ball, paddle, player, midX);
        ball.x=ball.x+ball.speedX;
        ball.y=ball.y+ball.speedY;}
    else { player.hits=11;
        info_to_player.innerHTML="Refresh page; then answer questions to right"
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
    context.fillStyle='white'
    context.fillText("Hits: " + player.hits, 20, paddle.y+30);
    //context.fillText("High score: " + player.hightscore, canvas.width-140, player.y+30);
    context.strokeStyle='purple';
    context.strokeText("Hits: " + player.hits, 20, paddle.y+30);

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


}

