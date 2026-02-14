
const working_submit1=document.getElementById("threading1");//submit button
const working_button1=document.getElementById("changing1")//change text
const numsum1=document.getElementById("display_sum1");//sum of nums
const post1=document.getElementById("display1") ; //question posed here
const ansHere1=document.getElementById('inputbox1'); //ans goes here
const correction1=document.getElementById('response1'); //correction goes here
var displayedAns1;
working_button1.innerHTML="Enter your ans, then push me";

const working_submit2=document.getElementById("threading2");//submit button
const working_button2=document.getElementById("changing2")//change text
const numsum2=document.getElementById("display_sum2");//sum of nums
const post2=document.getElementById("display2") ; //question posed here
const ansHere2=document.getElementById('inputbox2'); //ans goes here
const correction2=document.getElementById('response2'); //correction goes here
var displayedAns2;
working_button2.innerHTML="For this sec question, enter your ans, then push me";


var numList=[]
var num1=[];
var num;
var count1=0;
var resetCount1=0;

function operands (post, numsum, n1, n2) {
    for (let i=0;i<50;i++){
        num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post.innerHTML=`the numbers to be added are ${num1[n1]} and ${num1[n2] }`;
        let sum =num1[n1]+num1[n2];
        numsum.innerHTML="this is the sum: " + sum;
        return sum
        }


working_button1.addEventListener('click', function (){display("display_ans1", ansHere1, correction1, sum1), count++; working_button1.textContent=count;
    })
working_button2.addEventListener('click', function (){display("display_ans2", ansHere2, correction2, sum2), count++; working_button2.textContent=count;
    })



function display(displaying, ansHere, correction, summing){
    displayedAns=document.getElementById(displaying) ;   
    displayedAns.innerHTML=`your answer of ${ansHere.value}`;
    if (ansHere.value==summing)
        {correction.innerHTML="correct"}
    else{correction.innerHTML="get paper and pen, please."}
}

  


const sum1= operands(post1, numsum1, 4, 12);
const sum2= operands(post2, numsum2, 13, 7);

