

        const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
        const berries = ['Strawberry', 'Blueberry', 'Raspberry', 'Blackberry', 'Elderberry'];
        
        let text = '';


        
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
                text += items[i] + ' ';
            }
        }

        for (let i = 0; i < items.length; i++) {    //console.log(items[i].length);//1st instruction in the loop, it will print the length of each item in the array
            //2nd instruction, it will check if the length of the item is greater than 5
                if (items[i].length < 6) {
                    //change the color of the text to red if the length of the item is less than 6, but only for the items that are in the berries array
                    if (berries.includes(items[i])) {   
                    displayItem.style.color = 'red';
                   
                   text += items[i] + ' ';}
                }
            }
        // displayItem.textContent = text;
        
        displayItem.innerHTML=text