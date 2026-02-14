//I need to expand code below so it will work on three problems
//funtionalize button
import {PI, circumference} from "./toycalculator.js";

//------------func study
var inputted=document.getElementById("testInput");
var btn =document.getElementById("testBtn");
var submitting =document.getElementById("testSUBMIT");
var ans =document.getElementById("funcStudy");
var parentting=document.getElementById("parenting")
var thief=document.getElementById("thiefing")

console.log(inputted.value)


var ansList=[]
var newList=[]

var getInfo=function(){ansList.push(inputted.value);
  ans.innerHTML=ansList;  
    thief.innerHTML=parentting.ansList
  return ansList
}
    
 btn.addEventListener("click", getInfo)



//--------------------------------------------------------------

const radial=document.getElementById("getRadius");

const working_submit=document.getElementById("threading");//submit button
const working_button=document.getElementById("changing")//change text
const numsum=document.getElementById("display_sum");//sum of nums
const post=document.getElementById("display") ; //question posed here
const ansHere=document.getElementById('inputbox'); //ans goes here
var displayedAns;
working_button.innerHTML="enter your ans, then push me";//text on button
//module study Circumference

const calcBtn=document.getElementById("calculate");



var num1=[];
var num;
function operand1 () {
    for (let i=0;i<50;i++){
        num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post.innerHTML=`the numbers to be added are ${num1[6]} and ${num1[12] }`;
        var sum =num1[6]+num1[12];
        numsum.innerHTML="this is the sum: " + sum;
        }

working_button.addEventListener('click', function (){
    displayedAns=document.getElementById("display_ans") ;   
    displayedAns.innerHTML=`your answer of ${ansHere.value}`;})

calcBtn.addEventListener('click',  function (){
    const ShowRad= document.getElementById("showRad");
    const showCir=document.getElementById("showCircumference");
    var ans=circumference(radial.value)
    ShowRad.innerHTML=`this is the circumferemce ${ans.toFixed(4)}`;
    if (radial.value>40){showCir.innerHTML="too big";}
    else{showCir.innerHTML="Cir is fine";}
    })

operand1();