










function Get_Info(message, userPutIN ){
    let userInput=document.querySelector(userPutIN);
   
    let message1=document.querySelector(message);
       
  //  message.innerHTML=userInput.value;
  let ans= message1.textContent=Number(userInput.value);
  //see if we can get compare this ans with new_problm ans
}

function new_problem(problem){

    var subj="the boy bought ";
    var add1=Math.floor(Math.random()*10);
    var secPart=" and he bought ";
    var add2=Math.floor(Math.random()*10);
    var query=" more. How many does he have now?";
    document.getElementById(problem).innerHTML=subj + add1 
    + secPart + add2 + query;
  }

