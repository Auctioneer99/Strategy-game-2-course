const mongoose = require("mongoose");

let LobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  player1: {
    type: String,
    //required: true,
  },
  player2: {
    type: String,
    //required: true,
  },
  result: {
    type: String,
    //required: true,
  },
  date: {
    type: Date,
    //required: true,
  },
  data: {
    type: String,
    //required: true,
  },
});

let Lobby = mongoose.model("Lobby", LobbySchema);

module.exports = Lobby;
