const EventSystem = require("./EventSystem.js");
class Tile {
  constructor(id, connections, lobby) {
    this._id = id;
    this._connections = connections;
    this._lobby = lobby;
    this._unit = null;
    this._events = new EventSystem();
  }
  get Events() {
    return this._events;
  }
  get Id() {
    return this._id;
  }
  get Connections() {
    return this._connections;
  }
  get Unit() {
    return this._unit;
  }
  set Unit(value) {
    this._unit = value;
    this.Notify("Unit", value == null ? null : value.Id);
    //console.log(value);
    this.Events.DispatchEvent("Unit", value);
  }
  get Lobby() {
    return this._lobby;
  }
  Notify(attribute, value) {
    this.Lobby.Notify({
      attribute: attribute,
      value: value,
      path: ["Tiles", this.Id],
    });
  }
  CheckZoneControl() {
    for (let i = 0; i < 6; i++)
      if (this.Connections[i] != null) {
        let u = this.Connections[i].Unit;
        if (u != null) {
          if (u.Side != this.Unit.Side) {
            return true;
          }
        }
      }
    return false;
  }
  IsInRange(distance, tile) {
    let queue1 = [this];
    let queue2 = [];
    let result = [];
    for (let i = 0; i < distance; i++) {
      for (let j = 0; j < queue1.length; j++) {
        result.push(queue1[j]);
        for (let k = 0; k < 6; k++) {
          if (
            queue1[j].Connections[k] != null &&
            result.indexOf(queue1[j].Connections[k]) == -1
          ) {
            if (queue1[j].Connections[k] == tile) {
              return true;
            }
            queue2.push(queue1[j].Connections[k]);
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) {
        queue1.push(queue2[j]);
      }
      queue2 = [];
    }
    return false;
  }
  DistanceToTile(tile) {
    let iters = 20;
    let queue1 = [this];
    let queue2 = [];
    let result = [];
    for (let i = 0; i < iters; i++) {
      for (let j = 0; j < queue1.length; j++) {
        result.push(queue1[j]);
        for (let k = 0; k < 6; k++) {
          if (
            queue1[j].Connections[k] != null &&
            result.indexOf(queue1[j].Connections[k]) == -1
          ) {
            if (queue1[j].Connections[k] == tile) {
              return i + 1;
            }
            queue2.push(queue1[j].Connections[k]);
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) {
        queue1.push(queue2[j]);
      }
      queue2 = [];
    }
    return iters + 1;
  }
}

module.exports = Tile;
