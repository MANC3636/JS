/*Okay: I can generate a count of right answers.  Now I need to get that count into pong.js


const working_submit1=document.getElementById("threading1");//submit button
const working_button1=document.getElementById("changing1")//change text
const numsum1=document.getElementById("display_sum1");//sum of nums
const post1=document.getElementById("display1") ; //question posed here
const ansHere1=document.getElementById('inputbox1'); //ans goes here
const correction1=document.getElementById('response1'); //correction goes here
var displayedAns1;


const working_submit2=document.getElementById("threading2");//submit button
const working_button2=document.getElementById("changing2")//change text
const numsum2=document.getElementById("display_sum2");//sum of nums
const post2=document.getElementById("display2") ; //question posed here
const ansHere2=document.getElementById('inputbox2'); //ans goes here
const correction2=document.getElementById('response2'); //correction goes here
var displayedAns2;

const working_submit3=document.getElementById("threading3");//submit button
const working_button3=document.getElementById("changing3")//change text
const numsum3=document.getElementById("display_sum3");//sum of nums
const post3=document.getElementById("display3") ; //question posed here
const ansHere3=document.getElementById('inputbox3'); //ans goes here
const correction3=document.getElementById('response3'); //correction goes here
var displayedAns3;



let answered_correct=document.getElementById("correctAns")
 let funBtn=document.getElementById("triggering")

var numList=[] //not sure I use use this var
var num1=[];
var num;
var count;
export var count1;
var resetCount1=0;//i'm not sure I use this var

function operands (post, numsum, n1, n2) {
    for (let i=0;i<50;i++){
        num=Math.floor(Math.random()*10); //generates a num
        num>0? num1.push(num) :num1.push(1);//if num is "0", then it will be converted to a 1
        }//my numlist (num1) has fifty numbers
        post.innerHTML=`the numbers to be added are ${num1[n1]} and ${num1[n2] }`;
        let sum =num1[n1]+num1[n2];
        numsum.innerHTML="this is the sum: " + sum;
        return sum
        }

 count1=0;
function keepingScore(){count1++ //keepingScore allows use of info on correct answers
    answered_correct.innerHTML=count1;
    return count1;
}

function display(displaying, ansHere, correction, summing){    
    let displayedAns=document.getElementById(displaying) ;   
    displayedAns.innerHTML=`your answer of ${ansHere.value}`;
    if (ansHere.value==summing)
        {correction.innerHTML="correct";
        keepingScore();
        if (keepingScore()==6){funBtn.style.display="inline"}
        }
    else{correction.innerHTML="get paper and pen, please."}
    
}


//I have to call the func for each question.  Notice 3rd and 4th params; I have to manually pull the numbers from my numlist.
const sum1= operands(post1, numsum1, 4, 12);
const sum2= operands(post2, numsum2, 13, 7);
const sum3= operands(post3, numsum3, 23, 9);

working_button1.innerHTML ="Enter your ans then push me";
working_button2.innerHTML="For this sec question, enter your ans, then push me";
working_button3.innerHTML="For this sec question, enter your ans, then push me";


//I have to build a separate event listener for each question
working_button1.addEventListener('click', function (){display("display_ans1", ansHere1, correction1, sum1), count++; working_button1.textContent=count;
    })
working_button2.addEventListener('click', function (){display("display_ans2", ansHere2, correction2, sum2), count++; working_button2.textContent=count;
    })

working_button3.addEventListener('click', function (){display("display_ans3", ansHere3, correction3, sum3), count++; working_button3.textContent=count;
    })
*/