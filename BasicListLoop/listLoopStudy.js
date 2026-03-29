

        const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
        const berries = ['Strawberry', 'Blueberry', 'Raspberry', 'Blackberry', 'Elderberry'];
        
        let text = 'I am in displayItem: ';


        
        const list = document.getElementById('myList');

        const displayItem = document.getElementById('displayItem');//see line 9/* 
       
       /*  
        for (let i = 0; i < items.length; i++) {
            //console.log(items[i].length);//1st instruction in the loop, it will print the length of each item in the array
            if (items[i].length > 5) 
                {text += items[i] + ' ';}
            
        }  */
       //syntax to see if an item that is in the items array is in the berries array
        for (let i = 0; i < items.length; i++) {
            if (berries.includes(items[i])) {
                text += items[i] + '; ';
            }
        }
    let text1 = 'I am in displayItem:'; 
        for (let i = 0; i < items.length; i++) {   
            
                if (items[i].length > 6) {
                  if (berries.includes(items[i])) 
                        { 
                            displayItem.style.color = 'red';                   
                         text1 += " "+items[i] + '!';}
                    }
            }
        // displayItem.textContent = text;
        
        displayItem.innerHTML=text+ text1