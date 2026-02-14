import {username, num1, num2} from "./helper.js";

const button1=document.getElementById("mysubmit");
const response=document.getElementById("response");
const numCorrectAns=document.getElementById("correctAns")
let timesUsed;
var ans;

function correctAns(timesUsed){numCorrectAns.innerHTML=timesUsed}

function revu_ans(){ 
    timesUsed=0;
    ans =document.getElementById("input1");
    if (ans.value==num1+num2){
        timesUsed++
        response.innerHTML="That is the correct answer";}
        else {response.innerHTML="try using paper and pencil"}
        var responded=response.textContent
        
        correctAns(timesUsed)
        }


//odd syntax to get the value
button1.addEventListener('click', ()=>revu_ans() )

