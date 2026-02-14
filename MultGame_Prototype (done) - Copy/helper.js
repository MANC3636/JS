//okay.  Now I can set up algorithms here than can migrate to the HTML.  I use export here and
//import in the main js file (here insert.js)

console.log("okay, I can feed data to insert.js, which will change the html in math-insert")

export var username="Interloper";

export var num1=Math.floor(Math.random()*10);
export var num2=Math.floor(Math.random()*10);
export var num3=Math.floor(Math.random()*10);
export var num4=Math.floor(Math.random()*10);
export var num5=Math.floor(Math.random()*10);
export var num6=Math.floor(Math.random()*10);



export var phraseA=document.getElementById("phraseA")
export var phraseB=document.getElementById("phraseB")
export var input1=document.getElementById("input1");
export var phraseC=document.getElementById("phraseC")
export var phraseD=document.getElementById("phraseD")
export var input2=document.getElementById("input2");
export var phraseE=document.getElementById("phraseE")
export var phraseF=document.getElementById("phraseF")
export var input3=document.getElementById("input3");



phraseA.textContent="Farmer John has " + num1 + " boxes.";
phraseB.textContent="If he put " + num2 + " apples in each box, how many apples would he have?";
phraseC.textContent="There are " + num3 + " forks on each table.";
phraseD.textContent="If there are" + num4 + " tables, how many forks are there?";
phraseE.textContent="Some friends threw a party, and each friend gives " + num5 + "  dollars to the party.";
phraseF.textContent="If there are " + num6 + " friends, how much money was given?";







function mult1(num1, num2){return num1*num2;}
function mult2(num3, num4){return num3*num4;}
function mult3(num5, num6){return num5*num6;}




input1.setAttribute("placeholder",  username + ", try " + num1 + " times " +  num2);

//TODO:  separate PhaseA into A & B. What is the HTML for that?
//TODO: now I have to find a way to compare the input with the sum of 
