//I need to expand code below so it will work on three problems
//funtionalize button
//import {PI, circumference} from "./toycalculator.js";


//--------------------------------------------------------------

//const radial=document.getElementById("getRadius");

const working_submit1=document.getElementById("threading1");//submit button
const working_button1=document.getElementById("changing1")//change text
const numsum1=document.getElementById("display_sum1");//sum of nums
const post1=document.getElementById("display1") ; //question posed here
const ansHere1=document.getElementById('inputbox1'); //ans goes here
var displayedAns1;
working_button1.innerHTML="enter your ans, then push me";//text on button

const working_submit2=document.getElementById("threading2");//submit button
const working_button2=document.getElementById("changing2");//change text
const numsum2=document.getElementById("display_sum2");//sum of nums
const post2=document.getElementById("display2") ; //question posed here
const ansHere2=document.getElementById('inputbox2'); //ans goes here
var displayedAns2;
working_button2.innerHTML="enter your ans, then push me";//text on button

const working_submit3=document.getElementById("threading3");//submit button
const working_button3=document.getElementById("changing3")//change text
const numsum3=document.getElementById("display_sum3");//sum of nums
const post3=document.getElementById("display3") ; //question posed here
const ansHere3=document.getElementById('inputbox3'); //ans goes here
var displayedAns3;
working_button3.innerHTML="enter your ans, then push me";//text on button



var num1=[];
var num;
/*TODO: see if I can reduce these funcs to one using parameters fo the num1 values
as well as post & numsum*/ 

function operand1 () {
    for (let i=0;i<50;i++){
        var num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post1.innerHTML=`the numbers to be added are ${num1[6]} and ${num1[12] }`;
        var sum =num1[6]+num1[12];
        numsum1.innerHTML="this is the sum: " + sum;
        }

function operand2 () {
    for (let i=0;i<50;i++){
        var num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post2.innerHTML=`the numbers to be added are ${num1[4]} and ${num1[12] }`;
        var sum =num1[4]+num1[12];
        numsum2.innerHTML="this is the sum: " + sum;       
        }

function operand3 () {
    for (let i=0;i<50;i++){
                var num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post3.innerHTML=`the numbers to be added are ${num1[6]} and ${num1[13] }`;
        var sum =num1[6]+num1[13];
        numsum3.innerHTML="this is the sum: " + sum;
        }

function operands (post, numsum, n1, n2) {
    for (let i=0;i<50;i++){
        var num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post.innerHTML=`the numbers to be added are ${num1[n1]} and ${num1[n2] }`;
        var sum =num1[n1]+num1[n2];
        numsum.innerHTML="this is the sum: " + sum;
        }


operands(post1, numsum1, 4, 18)
operands(post2, numsum2, 9, 10)
operands(post3, numsum3, 12, 6)
//operand2()
//operand3()

working_button1.addEventListener('click', function (){
    displayedAns1=document.getElementById("display_ans1") ;   
    displayedAns1.innerHTML=`your answer of ${ansHere1.value}`;})

working_button2.addEventListener('click', function (){
    displayedAns2=document.getElementById("display_ans2") ;   
    displayedAns2.innerHTML=`your answer of ${ansHere2.value}`;})

working_button3.addEventListener('click', function (){
    displayedAns3=document.getElementById("display_ans3") ;   
    displayedAns3.innerHTML=`your answer of ${ansHere3.value}`;})

