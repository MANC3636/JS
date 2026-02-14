

const switchCondit=document.getElementById("switch");
const paraswitch=document.getElementById("switchpara");
switchCondit.innerHTML="Conditional";
paraswitch.innerHTML="Experimenting with the  more pedestrian if conditional. Why? I am having trouble with switch flow control"
const lang =document.getElementById("switchText");
var num1=Math.floor(Math.random()*10);

function mecurialMoods(num1){
        
        const getRandomKey=()=>{
            let mood1={happy:"happy", unhappy:"unhappy", ecstatic: "ecstatic"};
            const keys=Object.keys(mood1);
            const randomIndex=Math.floor(Math.random()*keys.length);
            const ans= keys[randomIndex];
            
            return ans;
        }
let ans=getRandomKey();
    if (ans=="happy"){
                lang.innerHTML="I'm so happy, I can fly!"};
            
    if (ans=="unhappy")
                {lang.innerHTML=`I'm melancholy and bereft: see this num? `;}
    if (ans== "ecstatic")
                {lang.innerHTML="Who needd druges, we are so ecstatic"};
    if (ans== "ecstatic" && num1==3)
                {lang.innerHTML="Who needs outside drugs,  we self medicate"};
                }
        

export {mecurialMoods, lang, num1, switchCondit, paraswitch}