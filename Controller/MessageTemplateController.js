require('dotenv').config();
const fs = require('fs');
const sdk = require('messagemedia-messages-sdk');
const messages_controller = sdk.MessagesController;

// MessageMedia Messages SDK Configuration
sdk.Configuration.basicAuthUserName = process.env.MM_API_KEY; // Your API Key
sdk.Configuration.basicAuthPassword = process.env.MM_API_SECRET_KEY; // Your Secret Key

class MessageTemplateController {

  initial(recipient, message, room) {
    return {
       "content":message,
       "source_number":process.env.LINE,
       "destination_number":recipient,
       "metadata": {
         "recipient":recipient,
         "room":room
       },
      "callback_url":process.env.CALLBACK_URL,
      "delivery_report":false
    }
  }

  intro(recipient) {
     return {
      "content":fs.readFileSync("intro.txt", 'utf-8'),
      "source_number":process.env.LINE,
      "destination_number":recipient,
      "metadata": {},
      "callback_url":process.env.CALLBACK_URL,
      "delivery_report":false
    }
  }

  reply(recipient, message, room) {
    return {
      "content":message,
      "source_number":process.env.LINE,
      "destination_number":recipient,
      "metadata": {
        "room":room,
        "recipient":recipient
      },
      "callback_url":process.env.CALLBACK_URL,
      "delivery_report":false
    }
  }

  end(recipient, message) {
     return {
      "content":message,
      "source_number":process.env.LINE,
      "destination_number":recipient,
      "metadata": {
        "won": true
      },
      "callback_url":process.env.CALLBACK_URL,
      "delivery_report":false
    }
  }

  alreadyWon(recipient) {
     return {
      "content":"You've already won the game and you're in the draw. Great job!",
      "source_number":process.env.LINE,
      "destination_number":recipient,
      "metadata": {
        "won": true
      },
      "callback_url":process.env.CALLBACK_URL,
      "delivery_report":false
    }
  }

  sendMessage(message){
    var body = new sdk.SendMessagesRequest({messages:[message]})
    messages_controller.createSendMessages(body, function(error, response, context) {
      console.log(response);
    });
  }

}

module.exports = new MessageTemplateController();
