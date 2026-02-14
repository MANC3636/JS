const game1 = document.getElementById("startGame");
const working_submit1 = document.getElementById("threading1");//submit button
const working_button1 = document.getElementById("changing1")//change text
const numsum1 = document.getElementById("display_sum1");//sum of nums
const post1 = document.getElementById("display1"); //question posed here
const ansHere1 = document.getElementById('inputbox1'); //ans goes here
const correction1 = document.getElementById('response1'); //correction goes here
var displayedAns1;


const working_submit2 = document.getElementById("threading2");//submit button
const working_button2 = document.getElementById("changing2")//change text
const numsum2 = document.getElementById("display_sum2");//sum of nums
const post2 = document.getElementById("display2"); //question posed here
const ansHere2 = document.getElementById('inputbox2'); //ans goes here
const correction2 = document.getElementById('response2'); //correction goes here
var displayedAns2;

const working_submit3 = document.getElementById("threading3");//submit button
const working_button3 = document.getElementById("changing3")//change text
const numsum3 = document.getElementById("display_sum3");//sum of nums
const post3 = document.getElementById("display3"); //question posed here
const ansHere3 = document.getElementById('inputbox3'); //ans goes here
const correction3 = document.getElementById('response3'); //correction goes here
var displayedAns3;



let answered_correct = document.getElementById("correctAns")
let funBtn = document.getElementById("triggering")

var numList = [] //not sure I use use this var
var num1 = [];
var num;
var count;
var count1;
var resetCount1 = 0;//i'm not sure I use this var

function operands(post, numsum, n1, n2) {
    for (let i = 0; i < 50; i++) {
        num = Math.floor(Math.random() * 10); //generates a num
        num > 0 ? num1.push(num) : num1.push(1);//if num is "0", then it will be converted to a 1
    }//my numlist (num1) has fifty numbers
    post.innerHTML = `the numbers to be added are ${num1[n1]} and ${num1[n2]}`;
    let sum = num1[n1] + num1[n2];
    numsum.innerHTML = "this is the sum: " + sum;
    return sum
}

count1 = 0;
function keepingScore() {
    count1++ //keepingScore allows use of info on correct answers
    answered_correct.innerHTML = count1;
    return count1;
}

function display(displaying, ansHere, correction, summing) {
    let displayedAns = document.getElementById(displaying);
    displayedAns.innerHTML = `your answer of ${ansHere.value}`;
    if (ansHere.value == summing) {
        correction.innerHTML = "correct";
        keepingScore();
        if (keepingScore() == 6) { funBtn.style.display = "inline" }
    }
    else { correction.innerHTML = "get paper and pen, please." }

}


//I have to call the func for each question.  Notice 3rd and 4th params; I have to manually pull the numbers from my numlist.
let sum1 = operands(post1, numsum1, 4, 12);
let sum2 = operands(post2, numsum2, 13, 7);
let sum3 = operands(post3, numsum3, 23, 9);

working_button1.innerHTML = "Enter your ans then push me";
working_button2.innerHTML = "For this sec question, enter your ans, then push me";
working_button3.innerHTML = "For this sec question, enter your ans, then push me";


//I have to build a separate event listener for each question
working_button1.addEventListener('click', function () {
    display("display_ans1", ansHere1, correction1, sum1), count++; working_button1.textContent = count;
})
working_button2.addEventListener('click', function () {
    display("display_ans2", ansHere2, correction2, sum2), count++; working_button2.textContent = count;
})

working_button3.addEventListener('click', function () {
    display("display_ans3", ansHere3, correction3, sum3), count++; working_button3.textContent = count;
})

/*---------------------------------------------------------------------*/
//const game1=document.getElementById("startGame");
game1.addEventListener("click", game)

function game() {
    //first let's get the canvas and context
    const canvas = document.querySelector("canvas") //canvas did not need an id; maybe b/s there's only one
    const context = canvas.getContext("2d");
    let title2 = document.getElementById("title1");
    const toggleBtn = document.getElementById("toggle");
    console.log("trying to start game")

    const midX = canvas.width / 2
    //now let's declare the ball, paddle & player & their starting values
    let ball = { x: midX, y: 0, speedX: 1, speedY: 5 }//why is the ball a var, but the paddle a const?
    const paddle = { x: midX - 50, y: canvas.height - 50, len: 100, direction: 0 }
    const player = { hits: 0, hightscore: 0 }
    var lang1 = "hi";

    //callback func for animation frame

    const render = () => {
        paddle.x = paddle.x + paddle.direction;

        if (player.hits <= 2) {
            ball.x = ball.x + ball.speedX;
            ball.y = ball.y + ball.speedY;
        }
        if (player.hits > 2) {
            player.hits--;
            title2.innerHTML = "Game Paused";
            toggleBtn.innerHTML = "click me";
            //toggleBtn.addEventListener('click', function (){toggleFunc()})
            game1.style.display = "none"
        }

        //sets up ball's bounce and no points for passing the paddle

        if (ball.x < 0 || ball.x > canvas.width) { ball.speedX = -ball.speedX; }
        if (ball.y < 0) { ball.speedY = -ball.speedY; }
        if (ball.y > paddle.y) {
            const isLeftOfPaddle = ball.x < paddle.x;
            const isRightOfPaddle = ball.x > paddle.x + paddle.len;
            if (isLeftOfPaddle || isRightOfPaddle) {
                ball = { x: midX, y: 0, speedX: 1, speedY: 5 };
                player.hits = 0;
            }
            else {
                ball.speedY = -ball.speedY; //turn this into a function
                const midPaddle = paddle.x + (paddle.len / 2);
                ball.speedX = .1 * (ball.x - midPaddle);
                player.hits++;

                if (player.hits > player.hightscore) { player.hightscore = player.hits; }
            }

        }

        //clear prev drawing
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();


        function toggleFunc() {
            player.hits = 4;
            context.font = "40px sans-serif";
            context.fillText("we're working", canvas.width / 2, canvas.height / 2)

        }



        //turning to the ball
        context.arc(ball.x, ball.y, 5, 0, Math.PI * 2);

        //paddle
        context.moveTo(paddle.x, paddle.y); //wehre is paddleY defined?
        context.lineTo(paddle.x + paddle.len, paddle.y);

        //draw ball & paddle
        context.stroke();

        //draw hit count and high score
        context.font = "20px sans-serif";
        context.fillText("Hits: " + player.hits, 20, paddle.y + 30);
        context.fillText("High score: " + player.hightscore, canvas.width - 140, player.y + 30);

        //resume game
        function buttonChange() { }


        //continue animation
        requestAnimationFrame(render);


    }

    //event handlers
    document.addEventListener("keydown", e => {
        if (e.code == "ArrowLeft") { paddle.direction = -5; }
        if (e.code == "ArrowRight") { paddle.direction = 5; }
    });


    document.addEventListener("keyup", (e) => { paddle.direction = 0; });

    requestAnimationFrame(render);
}

