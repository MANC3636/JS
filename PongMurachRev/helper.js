//okay.  Now I can set up algorithms here than can migrate to the HTML.  I use export here and
//import in the main js file (here insert.js)

console.log("okay, I can feed data to insert.js, which will change the html in math-insert")

export const username="Interloper";

export var num1=Math.floor(Math.random()*10);
export var num2=Math.floor(Math.random()*10);

var phraseA=document.getElementById("phraseA");
var phraseB=document.getElementById("phraseB");
var input1=document.getElementById("input1");

phraseA.textContent="I have " + num1 + " dollars.";

phraseB.textContent="If I add " + num2 + " dollars, how much do I have?";

function summation(num1, num2){return num1+num2;}




input1.setAttribute("placeholder",  username + ", try " + num1 + " + " +  num2);

//TODO:  separate PhaseA into A & B. What is the HTML for that?
//TODO: now I have to find a way to compare the input with the sum of 
