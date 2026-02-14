"use strict"




function ball_mvt(ball, paddle, player, midX){

    if (ball.x <0 || ball.x > canvas.width){ball.speedX=-ball.speedX;}
    if (ball.y <0){ball.speedY=-ball.speedY;}
    if (ball.y >= paddle.y){
        const isLeftOfPaddle =ball.x < paddle.x;
        const isRightOfPaddle=ball.x> paddle.x + paddle.len;
        if (isLeftOfPaddle || isRightOfPaddle){
            console.log("I am below the paddle")
            ball.x =midX; ball.y =0; ball.speedX=1; ball.speedY=5;
            player.hits=0;               
            }
        else{ball.speedY=-ball.speedY;
            const midPaddle=paddle.x+(paddle.len/2);
            ball.speedX=.1 * (ball.x-midPaddle);
            player.hits++;

            if (player.hits>player.hightscore){player.hightscore=player.hits;}
        }
    }
    return ball, paddle, player, midX
}





const miles=parseFloat(prompt("miles: "));
const kms=miles * 1.6034

//display the results
const results="miles: " + miles + "\n" +
                "kms: " + kms.toFixed(2);


//alert(isNaN(y))

export {ball_mvt}