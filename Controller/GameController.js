const fs = require('fs');
const TemplateController = require('./MessageTemplateController');
const sdk = require('messagemedia-messages-sdk');

const messages_controller = sdk.MessagesController;

class GameController {

  constructor() {
    var currentRoom = "";
    var recipient = "";
    var keyWords = ['help', 'open', 'read', 'reset'];
    this.keyWords = keyWords;
    this.currentRoom = currentRoom;
    this.recipient = recipient;
  }

  initGame(){
    var script = JSON.parse(fs.readFileSync("script.json", 'utf-8'));
    this.rooms = script.rooms;
  }

  startGame(recipient){
    var self = this;
    this.recipient = recipient;
    self.initGame();
    self.validateResponse(null, self.rooms[0]);
  }

  resetGame(){
    var message = TemplateController.reset(self.recipient);
    TemplateController.sendMessage(message);
  }

  help(helpMessage) {
    var self = this;
    var message = TemplateController.reply(self.recipient, helpMessage, self.currentRoom.name);
    TemplateController.sendMessage(message);
  }

  validateResponse(response = null, room) {
    var self = this;
    // This object will contain details of the room
    var _r = {};

    // To keep metadata lean, only the room name is stored. In the code below, the room object is created by referencing the room name
    if (typeof room === "string"){
      var script = JSON.parse(fs.readFileSync("script.json", 'utf-8'));
      this.rooms = script.rooms;
      var rooms = this.rooms;
      // Convert the room name in the metadata to a room object with details
      rooms.forEach(function(element) {
        Object.keys(element).forEach(function(k, v) {
          if (room === k){
            room = element
          }
        });
      });
    }

    // Assign room name to the _r object
    Object.keys(room).forEach(function(k, v) {
      _r = room[k];
      _r.name = k;
    });

    // Assign the exits to the _r object
    if (_r.exits) {
      Object.keys(_r.exits).forEach(function(k, v) {
        if (parseInt(_r.exits[k]) != -1) {
          _r[k] = _r["go " + k] = _r.exits[k];
        }
      });
    }

    // Assign the objects to the _r object
    if (_r.objects) {
      Object.keys(_r.objects).forEach(function(k, v) {
        _r[k] = _r.objects[k];
      });
    }

    // Clean up unused variables. DO NOT DELETE THIS BIT!
    delete _r.exits;
    delete _r.actions;
    delete _r.objects;

    // Set currentRoom as the _r object
    self.currentRoom = _r;

    // Check for winning condition
    if ((_r.isExitRoom && _r.isExitRoom.toString()) === "true") {
      var self = this;
      const message = TemplateController.end(self.recipient, _r.description);
      TemplateController.sendMessage(message);
      return false;
    }

    // Check if its the inital message
    if (response == null){
      var self = this;
      var message = TemplateController.reply(self.recipient, _r.description, self.currentRoom.name);
      TemplateController.sendMessage(message);
      return true;
    }

    // Validate the response
    if (response.trim().length == 0) {
      console.log('C\'mon, you can do better than that..');
    // Keyword response (eg: open mailbox)
    } else if (self.keyWords.indexOf(response) >= 0 || self.keyWords.indexOf(response.split(' ')[0]) >= 0) {
      self.processKeyword(response, _r.name);
    // Proper response (eg: go north)
    } else if (_r[response]) {
      self.feeder(_r[response]);
    // Filter out swear words and unknown commands
    } else {
      var filterWords = ['fuck', 'crap', 'shit'];
      if (filterWords.indexOf(response) >= 0) {
        var msgs = [
          'Jeez..',
          '💩'
        ];
        //console.log(msgs[Math.ceil(Math.random() * msgs.length) - 1], '\n');
        var errMessage = msgs[Math.ceil(Math.random() * msgs.length) - 1];
        var message = TemplateController.reply(self.recipient, errMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      } else {
        //console.log(errMessage);
        var errMessage = 'That is not a valid command. Enter a verb and an action like "go north". Text `help` for a hint.';
        var message = TemplateController.reply(self.recipient, errMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      }
    }
  }

  processKeyword(response, room) {
    var self = this;
    if (response == 'help') {
      self.help(self.currentRoom.contextualHelp);
    } else if (response == 'reset') {
      self.reset();
    } else if (response.split(" ")[0] == 'open' || response.split(" ")[0] == 'Open') {
      self.open(room, response.split(" ")[1]);
    } else if (response.split(" ")[0] == 'read' || response.split(" ")[0] == 'Read') {
      self.read(room, response.split(" ")[1]);
    } else {
      if (response.split(" ").length < 1 || response.split(" ").length > 1) {
        //console.log(errMessage);
        var errMessage = 'Enter a verb and a action. Text `help` a hint.';
        var message = TemplateController.reply(self.recipient, errMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      }
    }
  }

  feeder(roomName){
    var self = this;
    var found = false;

    Object.keys(self.rooms).forEach(function(key) {
      var _r = self.rooms[key];
      if (found) return;

      if (roomName == 'nothing') {
        found = true;
        var msgs = [
          'Looks like there is nothing here..',
          'Looks boring, lets go back..',
          'Nothing interesting here..'
        ];
        //console.log(msgs[Math.ceil(Math.random() * msgs.length) - 1], '\n');
        var errMessage = msgs[Math.ceil(Math.random() * msgs.length) - 1];
        var message = TemplateController.reply(self.recipient, errMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
        // return self.validateResponse(null, self.currentRoom);
      }

      Object.keys(_r).forEach(function(k, v) {
        if (k === roomName) {
          found = true;
          self.currentRoom = _r;
          return self.validateResponse(null, _r);
        }
      });
    });
  }

  open(room, item) {
    var self = this;
    if (item == "mailbox"){
      if (room == "room1") {
        //console.log('Opening the small mailbox reveals a leaflet.');
        var infoMessage = 'Opening the small mailbox reveals a leaflet.';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      } else {
        //console.log('You cannot do that.');
        var infoMessage = 'There is no mailbox over here.';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      }
    } else {
      var infoMessage = 'You cannot do that.';
      var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
      TemplateController.sendMessage(message);
    }
  }

  read(room, item) {
    var self = this;
    if (item == "leaflet") {
      if (room == "room1") {
        //console.log('WELCOME to DORK!/n/nDork is a text-based adventure game inspired by Zork. The aim of the game is to find the exit gate and leave the maze.');
        var infoMessage = 'WELCOME to DORK! Dork is a text-based adventure game inspired by Zork. The aim of the game is to find the exit gate and leave the maze.';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      } else {
        //console.log('You cannot do that.');
        var infoMessage = 'There is no leaflet over here.';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      }
    } else if (item == "engravings" || item == "engraving") {
      if (room == "room2") {
        //console.log('WELCOME to DORK!/n/nDork is a text-based adventure game inspired by Zork. The aim of the game is to find the exit gate and leave the maze.');
        var infoMessage = '01000101 01111000 01101001 01110100 00100000 01110110 01101001 01100001 00100000 01110100 01101000 01100101 00100000 01100110 01101111 01110010 01100101 01110011 01110100';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      } else {
        //console.log('You cannot do that.');
        var infoMessage = 'There are no engravings over here.';
        var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
        TemplateController.sendMessage(message);
      }
    } else {
      var infoMessage = 'You cannot do that.';
      var message = TemplateController.reply(self.recipient, infoMessage, self.currentRoom.name);
      TemplateController.sendMessage(message);
    }
  }

}

module.exports = new GameController();
