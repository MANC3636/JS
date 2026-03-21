function loadElement(url, elementId) {
    const element = document.createElement("p");//
    
    element.src = url;// Set the source of the element to the provided URL
    element.id = elementId;
    element.type="none";
    element.async=true;// Set the ID of the element to the provided elementId
    document.getElementById("subcontainer").appendChild(element);
    element.innerHTML = "created by loadElement; I can created elements dynamically!";// Append the element to the container with the ID "subcontainer"
    

}

let start = setInterval(() => {loadElement("script.js", "myFrame");}, 1000);
// Call the loadElement function every 1000 milliseconds (1 second) with the specified URL and element ID

setTimeout(() => {clearInterval(start);}, 5000);
// After 5000 milliseconds (5 seconds), clear the interval to stop calling the loadElement function repeatedly

function checkVars() {
if (true) {
    let var1="Pablo is a let";
    const var2="Pablo is a const";
    var1="Pablo is a let, but I can change it";
    //var2="Pablo is a const, but I can't change it"; // This will throw an error because var2 is a constant and cannot be reassigned.
    var var3="Pablo is a var";
    console.log(var1);
    console.log(var2 + " and I can't change it");
   
    }
 console.log(var3+" is inside the if block, but, I must stay in the function scope");
   

}
checkVars();
