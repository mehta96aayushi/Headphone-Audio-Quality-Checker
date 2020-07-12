const express = require('express')
var app = express()

let recordingRoute = require('./routes/recording')

app.use(recordingRoute)

app.use(express.static('public'))


const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.info(`Server has started on ${PORT}....`))

app.get("/", (req, res) => {
    console.log("Responding to root route")
    res.send("Hello from root route!")
})

/*app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`)
    
    // connection.connect();
    connection.query('SELECT person_name FROM hello_world', function(error, results, fields){
        if(error)
            console.log(`Error connecting ${error}`);
        else
            // res.json(results)
            res.send(results[0].person_name);
    });
    // connection.end();
})*/