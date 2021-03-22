const fs = require("fs");
const Tile = require("./tile.js");
const Units = require("./units.js");
const EventSystem = require("./EventSystem.js");
const Player = require("./player.js");
const User = require("../../models/User");

class Lobby {
  constructor(name, io, lobbyManager) {
    this._lobbyManager = lobbyManager;
    this._name = name;
    this._io = io;
    this._units = [];
    this._events = new EventSystem();
    this._round = 0;
    this._tiles = [];
    this._queue = [];
    this._waitQueue = [];
    this._originQueue = [];
    this._player1 = new Player();
    this._player2 = new Player();
    this._persons = [];
    this._actionQueue;
    this._unitsCounter = 0;
    let t = fs.readFileSync("public/data/field.txt").toString().split("#");
    let tiles = [];
    for (let i = 0; i < t.length; i++) {
      let v = t[i].split(" ");
      let n = v[0];
      v.splice(0, 1);
      for (let i = 0; i < v.length; i++) {
        v[i] = parseInt(v[i]);
      }
      tiles.push(new Tile(parseInt(n), v, this));
    }
    for (let i = 0; i < tiles.length; i++) {
      for (let j = 0; j < 6; j++) {
        let n = tiles[i].Connections[j];
        tiles[i].Connections[j] = n == -1 ? null : tiles[n];
      }
    }
    this._tiles = tiles;
  }
  get Persons() {
    return this._persons;
  }
  get LobbyManager() {
    return this._lobbyManager;
  }
  //region Get and Set
  get Name() {
    return this._name;
  }
  get Listeners() {
    return this._io.to(this.Name);
  }
  get Events() {
    return this._events;
  }
  /*
  get Io() {
    return this._io;
  }*/
  get Player1() {
    return this._player1;
  }
  set Player1(value) {
    if (value == null) {
      if (this.Player1 != null) {
        console.log(this.Player1.toString() + " disconnected");
      }
    } else {
      console.log(value.toString() + " connected");
    }
    this._player1 = value;
    this.Notify({
      attribute: "Player1",
      value: this.FormatUser(this.Player1),
      path: [],
    });
  }
  get Player2() {
    return this._player2;
  }
  set Player2(value) {
    if (value == null) {
      if (this.Player2 != null) {
        console.log(this.Player2.toString() + " disconnected");
      }
    } else {
      console.log(value.toString() + " connected");
    }
    this._player2 = value;
    this.Notify({
      attribute: "Player2",
      value: this.FormatUser(this.Player2),
      path: [],
    });
  }
  get ActionQueue() {
    return this._ActionQueue;
  }
  get Round() {
    return this._round;
  }
  set Round(value) {
    this._round = value;
    this.Notify({ attribute: "Round", value: value, path: [] });
    this.Notify("log", "round " + value + " begins");
  }
  get Tiles() {
    return this._tiles;
  }
  get Queue() {
    return this._queue;
  }
  set Queue(value) {
    this._queue = value;
    let temp = [];
    this.Queue.forEach((q) => {
      temp.push(q.Id);
    });
    this.Notify({ attribute: "Queue", value: temp, path: [] });
    if (value.length == 0) {
      this.NewRound();
    }
  }
  get WaitQueue() {
    return this._waitQueue;
  }
  set WaitQueue(value) {
    this._waitQueue = value;
  }
  get OriginQueue() {
    return this._originQueue;
  }
  set OriginQueue(value) {
    this._originQueue = value;
  }
  get Units() {
    return this._units;
  }
  get CurrentUnit() {
    return this.Queue[0];
  }
  //endregion Get and Set
  Start() {
    this.NewRound();
  }
  End(looser) {
    let winner = looser == "Red" ? "Yellow" : "Red";
    this.Log("Игра закончена, победитель - " + winner);
    console.log("Игра закончена, победитель - " + winner);
    if (this.Player1.User._id) {
      this.Player1.User.games++;
      if (winner == "Yellow") {
        this.Player1.User.wins++;
      }
      this.Player1.User.save();
      /*
      User.updateOne(
        { login: this.Player1.User.login },
        { $inc: winner == "Yellow" ? { games: 1, wins: 1 } : { games: 1 } }
      );
      */
    }
    if (this.Player2.User._id) {
      this.Player2.User.games++;
      if (winner == "Red") {
        this.Player2.User.wins++;
      }
      this.Player2.User.save();
    }
    this.Events.DispatchEvent("end", this);
    this.LobbyManager.CloseLobby(this);
    let p = [];
    this.Persons.forEach((socket) => {
      p.push(socket);
    });
    for (let i = 0; i < p.length; i++) {
      let socket = p[i];
      socket.leave(this.Name);
      socket.disconnect(true);
    }
  } /*
  AddEventListener(eventName, handler) {
    if (eventName in this._callbacks) {
      this._callbacks[eventName].push(handler);
    } else {
      this._callbacks[eventName] = [handler];
    }
  }
  DispatchEvent(eventName, target) {
    console.log(target.toString() + " invoke " + eventName);
    if (this._callbacks[eventName]) {
      this._callbacks[eventName].forEach((handler) => handler(target));
    }
  }*/
  Notify(data) {
    this.Listeners.emit("Lobby", data);
  }
  Log(data) {
    this.Listeners.emit("log", data);
  }
  PlayerJoin(req) {
    if (this.Player1.Cookie && this.Player2.Cookie) {
      return false;
    }
    let player = new Player(req);
    if (!player.Cookie) {
      return false;
    }
    if (!this.Player1.Cookie) {
      this.Player1 = player;
    } else {
      this.Player2 = player;
    }
    this.BindEventsOnPlayer(req);
    return true;
  }
  AddToQueue(unit) {}
  RemoveFromQueue(unit) {
    let temp = [];
    this.Queue.forEach((u) => {
      if (u != unit) {
        temp.push(u);
      }
    });
    this.Queue = temp;
  }
  AddUnit(unit, tile) {
    this.Units.push(unit);
    unit.Tile = tile;
    this._unitsCounter++;
    this.Listeners.emit("addUnit", this.FormatUnit(unit));
  }
  RemoveUnit(unit) {
    this.RemoveFromQueue(unit);
    for (let i = 0; i < this.Units.length; i++) {
      if (this.Units[i] == unit) {
        this.Units.splice(i, 1);
        break;
      }
    }
    this.Listeners.emit("removeUnit", unit.Id);
  }
  toString() {
    return this.Name;
  }
  NewRound() {
    this.Round++;

    let queue = [];
    this.Units.forEach((u) => {
      u.CurrentMoves = u.MaxMoves;
      u.RefreshSkills();
      queue.push(u);
    });
    console.log("new round");
    queue.sort((a, b) => (a.CurrentInitiative > b.CurrentInitiative ? -1 : 1));
    this.Log("Round " + this.Round);
    console.log("Очередь: ");
    this._queue.forEach((q) => console.log(q.toString()));
    this.Queue = queue;
    /*this.OriginQueue = [];
    this.Queue.forEach((q) => {
      this.OriginQueue.push(q);
    });*/

    //this.persons.emit("newRound");

    //console.log("  Ход " + this.queue[0].name + "  " + this.queue[0].id);
    //this.queue[0].startTurn();
    //this.persons.emit("unitTurn", this.queue[0].id);
  }
  ConnectPerson(socket) {
    this.SendSession(socket);
    socket.join(this.Name);
    this.Persons.push(socket);
    if (
      !(
        socket.session["connect.sid"] !== this.Player1.Cookie &&
        socket.session["connect.sid"] !== this.Player2.Cookie
      )
    ) {
      this.BindEventsOnPlayer(socket);
    }
  }
  SendSession(socket) {
    let units = [];
    this.Units.forEach((u) => {
      units.push(this.FormatUnit(u));
    });
    let tiles = [];
    this.Tiles.forEach((t) => {
      let c = [];
      t.Connections.forEach((n) => {
        if (n != null) {
          c.push(n.Id);
        } else {
          c.push(-1);
        }
      });
      tiles.push({
        id: t.Id,
        connections: c,
        unit: t.Unit == null ? null : t.Unit.Id,
      });
    });
    let queue = [];
    this.Queue.forEach((q) => queue.push(q.Id));
    let data = {
      side:
        socket.session["connect.sid"] === this.Player1.Cookie
          ? "Yellow"
          : socket.session["connect.sid"] === this.Player2.Cookie
          ? "Red"
          : "Spectator",
      name: this.Name,
      tiles: tiles,
      units: units,
      round: this.Round,
      queue: queue,
      player1: this.FormatUser(this.Player1),
      player2: this.FormatUser(this.Player2),
    };
    socket.emit("data", data);
  }
  FormatUser(u) {
    return {
      Name: u.Name,
      winrate: u.User._id
        ? ((u.User.wins / u.User.games) * 100).toFixed(2) + "%"
        : "No data",
    };
  }
  FormatUnit(u) {
    let ab = [];
    for (let key in u.Abilities) {
      ab.push({
        name: u.Abilities[key].Name,
        currentreload: u.Abilities[key].CurrentReload,
        reload: u.Abilities[key].Reload,
      });
    }
    return {
      id: u.Id,
      name: u.Name,
      race: u.Race,
      originalHealth: u.OriginalHealth,
      maxHealth: u.MaxHealth,
      currentHealth: u.CurrentHealth,

      originalAttack: u.OriginalAttack,
      currentAttack: u.CurrentAttack,

      originalMoves: u.OriginalMoves,
      maxMoves: u.MaxMoves,
      currentMoves: u.CurrentMoves,

      originalInitiative: u.OriginalInitiative,
      currentInitiative: u.CurrentInitiative,

      canCounterAttack: u.CanCounterAttack,
      canWait: u.CanWait,
      ranged: u.Ranged,
      tile: u.Tile ? u.Tile.Id : -1,
      side: u.Side,
      abilities: ab,
    };
  }
  CheckHost(socket) {
    return (
      this.Queue[0] &&
      socket.session["connect.sid"] ===
        (this.Queue[0].Side == "Red"
          ? this.Player2.Cookie
          : this.Player1.Cookie)
    );
  }
  CheckData(args) {
    for (let i = 1; i < args.length; i++) {
      if (typeof args[i] != "number") {
        return false;
      }
    }
    return true;
  }
  BindEventsOnPlayer(socket) {
    socket.on("disconnect", (socket) => {
      this.Persons.splice(this._persons.indexOf(socket), 1);
    });
    socket.on("ability", (data) => {
      if (!this.CheckHost(socket) /* || !this.CheckData(arguments)*/) {
        return;
      }
      this.CurrentUnit.UseAbility(data);
    });
    socket.on("message", (msg) => {
      let s = msg.trim();
      if (s == "") {
        return;
      }
      this.Listeners.emit(
        "message",
        s,
        socket.session["connect.sid"] == this.Player1.Cookie
          ? this.Player1.User.login
          : this.Player2.User.login
      );
    });
    socket.on("addunit", (id) => {
      this.AddUnit(new Units.Peasant(this, "Red", this.Tiles[id]));
    });
    socket.on("disconnect", () => {
      console.log("Игрок вышел из " + this.Name);
    });
  }
}

module.exports = Lobby;
