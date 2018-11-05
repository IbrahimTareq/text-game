require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const TemplateController = require('./Controller/MessageTemplateController');
const GameController = require('./Controller/GameController');

const port = process.env.PORT
const app = express()
var router = express.Router()
app.use(bodyParser.json())

app.post('/game', (req, res) => {
   res.send(req.body)
   // If the body of the message is not empty
   if(typeof req.body.content != 'undefined') {

     var raw_reply = req.body.content
     // Lowercase the message and remove whitespaces
     var reply = raw_reply.toLowerCase().trim();
     var winning_condition = req.body.metadata.won
     var room = req.body.metadata.room
     var recipient = req.body.source_number

     // Use this to reset metadata
     // var message = TemplateController.intro(recipient);
     // TemplateController.sendMessage(message);

     // If the person has already won
     if (winning_condition != undefined){
       var message = TemplateController.alreadyWon(recipient);
       TemplateController.sendMessage(message);
     // If the person has not joined the game yet
     } else if (room == undefined && winning_condition == undefined) {
       var message = TemplateController.intro(recipient);
       TemplateController.sendMessage(message);
       // Initiate the game after 10 seconds
       setTimeout(function () {
            GameController.startGame(recipient);
       }, 10000);
     // If the person is already playing the game
     } else if (room != undefined) {
       GameController.validateResponse(reply, room);
     }

   }
});


app.listen(port, () => console.log(`Dork listening on port ${port}!`))
