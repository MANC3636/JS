
var header1=document.getElementById("eventHeader")
var inPut1=document.getElementById("input1")//the input widget
var Btn1=document.getElementById("btn1")
var paragraph1=document.getElementById("btnResponse")


var inPut2=document.getElementById("input2")//the input widget
var Btn2=document.getElementById("btn2")
var paragraph2=document.getElementById("btnResponse2")

var inPut3=document.getElementById("input3")//the input widget
var Btn3=document.getElementById("btn3")
var paragraph3=document.getElementById("btnResponse3")
var paragraph4=document.getElementById("btnResponse4")

var inPut4=document.getElementById("input4")//the input widget
var Btn4=document.getElementById("btn4")
var paragraph5=document.getElementById("btnResponse5")
var paragraph6=document.getElementById("btnResponse6")


let para1=5;
let para2=7;
let para3="W3Schools says use an anonymous func to call the parametered func"
let para4=3;
let para5=9;

Btn2.addEventListener('click', function(){
    paragraph1.innerHTML="this is interesting.  " + Bfunc(para3)
})

function calculation(a, b){
    let thisResult=3*8;
    return thisResult;
}

function Afunc(a,b){
    let result=a*b*calculation(para4, para5);
    paragraph1.innerHTML="this number is: " + result;
}

function Bfunc(quote){
    let language=quote;
    return paragraph2.innerHTML=language;
}
function Cfunc(quote){
    let language=quote;
    return paragraph4.innerHTML=language;
}

/*simple conditional study: Btn1 checks embedded conditionaals and Btn3 checks 
use of eventHandlers embedded in if conditional*/

Btn1.addEventListener('click', function(){//this is an event handler with embedded conditional
    if (false){Afunc(para1, para2)}
    else{setTimeout(()=>{Afunc(0, 5)}, 1000)}
    })


if (false){//here, the eventHandler is embedded in the conditinoal
    Btn3.addEventListener("click", ()=>{Cfunc("False was improperly triggered")})

    }
else {Btn3.addEventListener("click", ()=>Cfunc("true ws properly triggered"))}

//this is a study of how to get the value out of an addeventlistener.  What I have to do is put all of the functionality in the getRtnVal func

function getRtnValue(val){
    if (val=="this value was changed; I will use it to generate a boolean and then do something")
        {paragraph6.innerHTML=`I can use the value of a eventlistener & ${val}`; console.log(val);}
    else{console.log("I'm still working")}}
    

function dealWithClick(){
        let var1=paragraph5.innerHTML="this value was changed; I will use it to generate a boolean and then do something"
        
        //return val
        getRtnValue(var1)
        }
Btn4.addEventListener('click', dealWithClick)