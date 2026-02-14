

var arrayCatcher=document.getElementById("arrayItems")
var notes=document.getElementById("observations")

let inputted; 
var getterBtn=document.getElementById("inputBtn")

let array1=[];



getterBtn.onclick=function(){
    inputted = document.getElementById("inputtedNum").value
    array1.push(inputted)
    notes.innerHTML=`the length of array1 is \n 
    ${array1.length} and the contents are ${array1}`;
    if (array1.length>2){getterBtn.innerHTML="stop work and start play!"}
}


arrayCatcher.innerHTML= "this plus " ;
notes.innerHTML= `I can use 'onclick' to add inputted answers to an array \n
to dynaamically change the webpage, and to use array.len to do other things`