function paras (text, id, divid){
    this.text=text;
    this.id=id;
    


    this.changingPara=function(){
        const obj=document.getElementById(this.id)
        obj.innerHTML=this.text;
        obj.style.color="blue"

    }
    
        //working on this animation

    }

const newItem= new paras("this text can move", "para1")
const newItem2= new paras("Interlopers cannot move", "para2")
const container1=new paras("none", "container")


var idn;

var triggeringBtn=document.getElementById("trigger")

var animation1 =function(idx){
    const ob=document.getElementById(idx);
    var pos=0;
    clearInterval(idn)
    idn=setInterval(frame, 10);
    function frame(){
        if (pos==350){
            clearInterval(idn);
        } else{pos++;
            ob.style.top=pos +"px";
            ob.style.left=pos + "px";
        }
        }
    }

newItem.changingPara();
newItem2.changingPara();

triggeringBtn.addEventListener('click', animation1(newItem.id))
//triggeringBtn.addEventListener('click', animation1(container1.id))
