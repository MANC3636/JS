
const game1=document.getElementById("startGame")
// Listen for the event on another element
game1.addEventListener('my-custom-event', (event) => {
    game1.style.display="none"
    console.log('Custom event received:', event.detail.message);
  });

function game () {
//first let's get the canvas and context
const canvas=document.querySelector("canvas") //canvas did not need an id; maybe b/s there's only one
const context=canvas.getContext("2d");
let title2=document.getElementById("title1");
const toggleBtn=document.getElementById("toggle");
console.log("trying to start game")





const midX=canvas.width/2
//now let's declare the ball, paddle & player & their starting values
let ball={x:midX, y:0, speedX:1, speedY: 5}//why is the ball a var, but the paddle a const?
const paddle={x:midX-50, y:canvas.height-50, len:100, direction: 0}
const player={hits:0, hightscore:0}
var lang1="hi";


//callback func for animation frame


const render=()=> {
    paddle.x=paddle.x+paddle.direction;

    
    if (player.hits<=2 )
        {ball.x=ball.x+ball.speedX;
        ball.y=ball.y+ball.speedY;
        }
    if (player.hits>2) {player.hits--; 
        title2.innerHTML="Game Paused";         
        toggleBtn.innerHTML="click me";
        //toggleBtn.addEventListener('click', function (){toggleFunc()})
        game1.style.display="none"
            }
                  

    
//sets up ball's bounce and no points for passing the paddle


    if (ball.x <0 || ball.x > canvas.width){ball.speedX=-ball.speedX;}
    if (ball.y <0){ball.speedY=-ball.speedY;}
    if (ball.y > paddle.y){
        const isLeftOfPaddle =ball.x < paddle.x;
        const isRightOfPaddle=ball.x> paddle.x + paddle.len;
        if (isLeftOfPaddle || isRightOfPaddle){
            ball={x:midX, y:0, speedX:1, speedY: 5};
            player.hits=0;          
            }
        else{ball.speedY=-ball.speedY; //turn this into a function
            const midPaddle=paddle.x+(paddle.len/2);
            ball.speedX=.1 * (ball.x-midPaddle);
            player.hits++;

            if (player.hits>player.hightscore){player.hightscore=player.hits;}
            }

        }
    
    //clear prev drawing
    context.clearRect(0,0, canvas.width, canvas.height);
    context.beginPath();

    



    function toggleFunc(){player.hits=4;
        context.font="40px sans-serif";
        context.fillText("we're working", canvas.width/2, canvas.height/2)
        
    }



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
    
    //resume game
    function buttonChange(){}
    

    //continue animation
    requestAnimationFrame(render);


}

//event handlers
document.addEventListener("keydown", e=>{
    if (e.code=="ArrowLeft"){paddle.direction=-5;}
    if (e.code=="ArrowRight"){paddle.direction=5;}
});

document.addEventListener("keyup", (e)=> {paddle.direction=0;});



 
requestAnimationFrame(render); 
    
}

game1.addEventListener("click", game)
canvas.addEventListener('my-custom-event', (event) => {
    game1.style.display="none";
    console.log('Custom event received:', event.detail.message); false
  });


 

