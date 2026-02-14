

/*


var people= [ james, harrys, rys]

people.forEach(function(Person){

    Person.on('speak', function(msg){

        console.log(Person.name + "said " + msg)
    })
})

james.emit('speak', "hey Jude")*/

const events=require('events')

var myEmitter=new events.EventEmitter();


myEmitter.on("someevent", function(text){
 
   
    console.log(text)

})

myEmitter.emit("someevent", 'the event was emitted')
