


const lang =document.getElementById("switchText");
const switchSwitch =document.getElementById("switch");
const realswitch2 =document.getElementById("switchpara");


var num1=Math.floor(Math.random()*10);

function mecurialMoods(num1){
        
        const getRandomKey=()=>{
            let mood1={happy:"happy", unhappy:"unhappy", ecstatic: "ecstatic"};
            const keys=Object.keys(mood1);
            const randomIndex=Math.floor(Math.random()*keys.length);
            const ans= keys[randomIndex];
            
            return ans;
        }
    
    switch(getRandomKey()){
            case "happy" :
                {
                lang.innerHTML="I'm so happy, I can fly!"};
                break;
            
            case "unhappy":
                {lang.innerHTML=`I'm melancholy and bereft: see this num? ${num1}`;}
                break;
            
            case "ecstatic":
                {lang.innerHTML="Who needd druges, we are so ecstatic"};
                if (num1<6 ){lang.innerHTML="who need ecstasy; my bod produces my own"}
                break;        
                }
            }

export {mecurialMoods, lang, num1, switchSwitch, realswitch2}