
const working_submit1=document.getElementById("threading1");//submit button
const working_button1=document.getElementById("changing1")//change text
const numsum1=document.getElementById("display_sum1");//sum of nums
const post1=document.getElementById("display1") ; //question posed here
const ansHere1=document.getElementById('inputbox1'); //ans goes here
const correction1=document.getElementById('response1'); //correction goes here
var displayedAns1;
working_button1.innerHTML="enter your ans, then push me";

var numList=[]
var num1=[];
var num;

function operands (post, numsum, n1, n2) {
    for (let i=0;i<50;i++){
        num=Math.floor(Math.random()*10);
        num>0? num1.push(num) :num1.push(1);
        }
        post.innerHTML=`the numbers to be added are ${num1[6]} and ${num1[12] }`;
        let sum =num1[6]+num1[12];
        numsum.innerHTML="this is the sum: " + sum;
        return sum
        }


working_button1.addEventListener('click',  ()=>{
    displayedAns1=document.getElementById("display_ans1") ;   
    displayedAns1.innerHTML=`your answer of ${ansHere1.value}`;
    if (ansHere1.value==sum1){correction1.innerHTML="correct"}
else{correction1.innerHTML="get paper and pen, please."}})

const sum1= operands(post1, numsum1, 4, 12);

function respond(sumNum, ansHere, correction){
    var corrective=correction.innerHTML;
    if (sumNum==ansHere){corrective="this is the correct answer"}
    else {corrective="consider using a pen and paper"}}
    
