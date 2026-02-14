import {username, num1, num2} from "./helper.js";

//1. I now have a helper module and I can start work on questions
//2. okay the code below allows me to compare input value with sum of num1 & num2 
//num1 and num2 are generated from another file
//3. now I can responsive to correct or bad answers
let collectedAns=[]; //this list will hold the answers
console.log("hello");
console.log(username);

const button=document.getElementById("mysubmit");
export const response=document.getElementById("response");
var ans;

//odd syntax to get the value
button.addEventListener('click', function(){
    ans =document.getElementById("input1");
    if (ans.value==num1+num2){response.innerHTML="that is the correct answer";}
    else{response.innerHTML="try adding on paper";
         collectedAns.push(ans.value);
         console.log(collectedAns);
         if (collectedAns.length>2){button.innerHTML="stop work"}
    }
    
   
    
})

