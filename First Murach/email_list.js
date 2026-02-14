"use strict"

function getElement(selector){
    return document.querySelector(selector);
}


function joinButtonClick(event){

    const email1=getElement("#email_1").value;
    const email2=getElement("#email_2").value;

    let invalid=false;
    if (email1==""){
        getElement("#email_1_error").textContent="Email is required.";
        invalid=true;
    }else{getElement("#email_1_error").textContent=" ";}

    if (email1 != email2){
        getElement("#email_2_error").textContent="Emails must match.";
        invalid=true;
    }else{getElement("#email_2_error").textContent=" ";}

    if (invalid){event.preventDefault();}
}


document.addEventListener("DOMContentLoaded", ()=>{
    getElement("#join_button").addEventListener("click", joinButtonClick);
})