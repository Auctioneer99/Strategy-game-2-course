const fs = require("fs");
const action = require("./action.js");
const units = require("./units.js");
const Tile = require("./tile.js");
const Player = require("./player.js");

class Session {
  constructor(name, io) {
    this.name = name;
    this.unitCount = 0;
    this.round = 0;
    this.units = [];
    this.tiles = [];
    this.queue = [];
    this.originQueue = [];
    this.player1 = new Player();
    this.player2 = new Player();
    this.io = io;
    this.actionQueue = new action.ActionQueue();
    this.ended = false;
  }
  /*---------------GETTERS-------------*/
  get currentUnit() {
    return this.queue[0];
  }
  get persons() {
    return this.io.to(this.name);
  }
  get host() {
    return this.queue[0].side == 0 ? this.player1.cook : this.player2.cook;
  }
  /*---------------SESSSION ACTIONS------------------*/
  joinPlayer(req, res) {
    if (this.player1.cook && this.player2.cook) return false;
    let player = new Player();
    if (!player.initUser(req)) return false;
    console.log(
      "Присоединение " + player.name + " к игрокам на сервере " + this.name
    );
    console.log(player);
    if (!this.player1.cook) {
      this.player1 = player;
    } else {
      this.player2 = player;
    }
    return true;
  }
  connectPlayer(socket) {
    if (
      socket.session["connect.sid"] !== this.player1.cook &&
      socket.session["connect.sid"] !== this.player2.cook
    )
      return;
    console.log("Переподключение игрока " + this.name);
    this.playerBindEvents(socket);
  }
  playerBindEvents(socket) {
    socket.on("addUnit", id => this.addUnitByName(id, "Archer", 0));
    socket.on("ability", (abilityID, tileID) =>
      this.unitUseAbility(abilityID, tileID, socket)
    );
    socket.on("message", msg => {
      if (msg.trim() == "") return;
      this.persons.emit(
        "message",
        msg.trim(),
        socket.session["connect.sid"] == this.player1.cook
          ? this.player1.name
          : this.player2.name
      );
    });
    socket.on("disconnect", () => {
      console.log("Игрок вышел " + this.name);
      return;
    });
  }
  closeSession(looser) {
    let winner = looser == 0 ? this.player2 : this.player1;
    console.log(winner.name + " - победитель");
    this.ended = true;
    this.persons.emit("sessionEnded", winner.name);
    ///Преобразоваие
  }
  nextTurn() {
    this.queue.splice(0, 1);
    if (this.queue.length == 0) {
      console.log("Очередь пуста");
      this.nextRound();
      return;
    }
    if (!this.queue[0].isExist()) {
      console.log("Так как юнита больше нет, наступает ход следующего юнита");
      this.nextTurn();
      return;
    }
    this.queue[0].startTurn();
    console.log("  Ход " + this.queue[0].name + "  " + this.queue[0].id);
    console.log("  ОП = " + this.queue[0].currentMoves);
    this.persons.emit("unitTurn", this.queue[0].id);
  }
  nextRound() {
    this.round++;
    console.log("Начинается " + this.round + " раунд");

    for (let i = 0; i < this.units.length; i++) this.units[i].refreshMoves();

    this.queue = [];
    this.originQueue = [];

    for (let i = 0; i < this.units.length; i++) this.queue.push(this.units[i]);

    this.queue.sort((a, b) =>
      a.currentInitiative > b.currentInitiative ? -1 : 1
    );

    console.log("Очередь: ");
    for (let i = 0; i < this.queue.length; i++)
      console.log("  " + this.queue[i].name + "  id: " + this.queue[i].id);

    for (let i = 0; i < this.queue.length; i++)
      this.originQueue.push(this.queue[i]);
    this.persons.emit("newRound");

    console.log("  Ход " + this.queue[0].name + "  " + this.queue[0].id);
    this.queue[0].startTurn();
    this.persons.emit("unitTurn", this.queue[0].id);
    this.personsSendQueue(this.queue);
  }
  startGame() {
    this.nextRound();
  }
  removeUnit(unitID) {
    for (let i = 0; i < this.units.length; i++) {
      if (unitID == this.units[i].id) {
        this.units.splice(i, 1);
        break;
      }
    }
  }
  /*-------------UNIT ACTIONS-----------------*/

  unitUseAbility(abilityID, tileID, socket) {
    if (abilityID === 2) return;
    if (this.checkHost(socket)) this.currentUnit.useAbility(abilityID, tileID);
  }
  /*--------------INIT--------------*/
  createField() {
    let t = fs
      .readFileSync("public/data/field.txt")
      .toString()
      .split("#");

    for (let i = 0; i < t.length; i++) {
      let v = t[i].split(" ");
      let n = v[0];
      v.splice(0, 1);
      for (let i = 0; i < v.length; i++) {
        v[i] = parseInt(v[i]);
      }
      this.tiles.push(new Tile(parseInt(n), v, this));
    }
  }
  addUnitByName(id, name, side) {
    this.addUnit(new units[name](id, this, side), this.tileByID(id));
  }
  addUnit(unit, tile) {
    this.units.push(unit);
    unit.tile = tile;
    tile.unit = unit;
    this.persons.emit("addUnit", this.unitToSend(unit));
    unit.appearanceHandler();
  }
  /*------------------CHECKES-------------*/
  checkHost(socket) {
    if (this.ended) {
      console.log("Сессия окончена");
      return false;
    }
    return socket.session["connect.sid"] === this.host;
  }
  checkAbility(abilityID, socket) {
    if (!this.checkHost(socket)) return false;
    if (typeof abilityID != "number") return false;
    return true;
  }
  /*-----------FIND-----------*/
  tileByID(tileID) {
    return this.tiles[tileID];
  }
  unitByID(unitID) {
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].id == unitID) return this.units[i];
    }
    console.log("  Юнит не найден");
    return false;
  }
  /*----------------SENDING DATA------------------*/
  sessionToSend(socket) {
    let p = -1;
    if (socket != null) {
      if (socket.session["connect.sid"] === this.player1.cook) p = 0;
      if (socket.session["connect.sid"] === this.player2.cook) p = 1;
    }
    let tiles = [];
    for (let i = 0; i < this.tiles.length; i++)
      tiles.push(this.tileToSend(this.tiles[i]));
    let units = [];
    for (let i = 0; i < this.units.length; i++)
      units.push(this.unitToSend(this.units[i]));
    if (socket != null) this.socketSendQueue(this.queue, socket);
    return {
      player: p,
      p1: this.player1.name,
      p2: this.player2.name,
      name: this.name,
      tiles: tiles,
      units: units,
      round: this.round,
      unit: fs.readFileSync("G:\\course\\public\\obj\\unit.obj", "utf-8")
    };
  }
  socketSendQueue(queue, socket) {
    for (let i = 0; i < queue.length; i++)
      socket.emit("addToQueue", queue[i].id);
  }
  personsSendQueue(queue) {
    for (let i = 0; i < queue.length; i++)
      this.persons.emit("addToQueue", queue[i].id);
  }
  unitToSend(unit) {
    let effects = [];
    for (let i = 0; i < unit.effects.length; i++)
      effects.push(this.effectToSend(unit.effects[i]));
    return {
      id: unit.id,
      name: unit.name,

      originHealth: unit.originHealth,
      health: unit.health,
      currentHealth: unit.currentHealth,

      originAttack: unit.originAttack,
      currentAttack: unit.currentAttack,

      originMoves: unit.originMoves,
      moves: unit.moves,
      currentMoves: unit.currentMoves,

      originInitiative: unit.originInitiative,
      currentInitiative: unit.currentInitiative,

      canCounterAttack: unit.canCounterAttack,
      canWait: unit.canWait,
      effects: effects,
      ranged: unit.ranged,
      tileID: unit.tile.id,
      side: unit.side,
      abilities: [
        this.abilityToSend(unit.abilities[5]),
        this.abilityToSend(unit.abilities[6]),
        this.abilityToSend(unit.abilities[7])
      ]
    };
  }
  abilityToSend(ab) {
    if (!ab) return null;
    return {
      reload: ab.reload,
      currentReload: ab.currentReload,
      cost: ab.cost,
      toAlly: ab.toAlly,
      toEnemy: ab.toEnemy,
      targeting: ab.targeting,
      range: ab.range,
      name: ab.name,
      img: "/lol",
      description: "lol eke"
    };
  }
  effectToSend(effect) {
    return {
      name: effect.name
    };
  }
  tileToSend(tile) {
    if (tile.unit == null)
      return {
        id: tile.id,
        connections: tile.connections,
        unit: null
      };
    else
      return {
        id: tile.id,
        connections: tile.connections,
        unitID: tile.unit.id
      };
  }
}
module.exports = Session;

/*

  /*
  checkAttack(tileID, socket) {
    if (!this.checkHost(socket)) return false;
    if (typeof tileID != "number") return false;
    console.log("  Атака: " + this.tileByID(tileID).unit.id);
    console.log(
      `  Проверка доступности нанесения удара: ${this.currentUnit.name} id ${
        this.currentUnit.id
      } => ${this.tileByID(tileID).unit.name} id ${
        this.tileByID(tileID).unit.id
      }`
    );
    if (this.tileByID(tileID).unit.side != this.currentUnit.side) return true;
    else return console.log("Нельзя нападать на своих");
  }
  
  checkMove(tileID, socket) {
    if (!this.checkHost(socket)) return false;
    if (typeof tileID != "number") return false;
    console.log("    Проверка на корректность передвижения :" + tileID);
    if (!tileID) {
      console.log("    Переменнная не передана");
      return false;
    }
    if (tileID == this.queue[0].tileID) {
      console.log("    Это точка на которой он стоит, лол");
      return false;
    }
    let p = this.queue[0].tile;

    let a = true;
    for (let i = 0; i < 6; i++)
      if (p.connections[i] == tileID && this.tileByID(tileID).unit == null) {
        a = false;
        break;
      }

    if (a) {
      console.log("    Движение определено неверно, точки не соприкасаются");
      return false;
    }

    //else {
    //	console.log("    Движение определено не верно, длина слишком большая");
    //	return false;
    //}

    console.log(
      "    Движение определено верно, передвижение на " +
        tileID +
        ", Длинна = " +
        1
    );
    return true;
  } */

/*socket.on("tryMove", tileID => this.unitMove(tileID, socket));
    socket.on("tryAttack", tileID => this.unitAttack(tileID, socket));
    socket.on("fortify", () => this.unitFortify(socket));
    socket.on("wait", () => this.unitWait(socket));*/
