export var username="Interloper";

export var num1=Math.floor(Math.random()*10);
export var num2=Math.floor(Math.random()*10);

var phraseA=document.getElementById("phraseA")
var phraseB=document.getElementById("phraseB")
var input1=document.getElementById("input1");

phraseA.textContent="I have " + num1 + " dollars.";
phraseB.textContent="If I add " + num2 + " dollars, how much do I have?";

function summation(num1, num2){return num1+num2;}




input1.setAttribute("placeholder",  username + ", try " + num1 + " + " +  num2);
