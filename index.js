//This function is used to handle incoming lambda functions, designed to be used by API Gateway.
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const TemplateController = require('./Controller/MessageTemplateController');
const GameController = require('./Controller/GameController');

const port = process.env.PORT
const app = express()
var router = express.Router()
app.use(bodyParser.json())

exports.handler = (event, context, callback) => {

    const body = JSON.parse(event.body)

    if(typeof body.content != 'undefined') {

      var raw_reply = body.content
      // Lowercase the message and remove whitespaces
      var reply = raw_reply.toLowerCase().trim();
      var winning_condition = body.metadata.won
      var room = body.metadata.room
      var recipient = body.source_number

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

    const response = {
      statusCode: 200,
      body: JSON.stringify({"message":"success"})
    };
    callback(null, response);

};
