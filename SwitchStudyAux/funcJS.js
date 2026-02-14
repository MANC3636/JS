
const getRandomKey = (obj) => {
    let display=document.getElementById("toyResults");
    
    const keys = Object.keys(obj);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const ans=keys[randomIndex];
    display.innerHTML=`this is the answer: ${obj[ans]}`;
    return ans
  };
  
  // Example usage:
  const exampleObject = {
    name: "Alice",
    age: 30,
    city: "New York"
  };
  
  const randomKey = getRandomKey(exampleObject);
  
  