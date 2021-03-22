class Tile {
  constructor(id, connections, session) {
    this.id = id;
    this.connections = connections;
    this.unit = null;
    this.session = session;
  }
  checkZoneControl() {
    for (let i = 0; i < 6; i++)
      if (this.connections[i] != -1) {
        let u = this.session.tileByID(this.connections[i]).unit;
        if (u != null) if (u.side != this.unit.side) return true;
      }
    return false;
  }
  reach(distance, tile) {
    let queue1 = [this];
    let queue2 = [];
    let result = [];
    for (let i = 0; i < distance; i++) {
      for (let j = 0; j < queue1.length; j++) {
        result.push(queue1[j].id);
        for (let k = 0; k < 6; k++) {
          if (
            queue1[j].connections[k] != -1 &&
            result.indexOf(queue1[j].connections[k]) == -1
          ) {
            if (queue1[j].connections[k] == tile.id) return true;
            queue2.push(this.session.tileByID(queue1[j].connections[k]));
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) queue1.push(queue2[j]);
      queue2 = [];
    }
    return false;
  } //Is in range?
  getReach(tile) {
    let iters = 20;
    let queue1 = [this];
    let queue2 = [];
    let result = [];
    for (let i = 0; i < iters; i++) {
      for (let j = 0; j < queue1.length; j++) {
        result.push(queue1[j].id);
        for (let k = 0; k < 6; k++) {
          if (
            queue1[j].connections[k] != -1 &&
            result.indexOf(queue1[j].connections[k]) == -1
          ) {
            if (queue1[j].connections[k] == tile.id) return i + 1;
            queue2.push(this.session.tileByID(queue1[j].connections[k]));
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) queue1.push(queue2[j]);
      queue2 = [];
    }
    return iters + 1;
  } //Distance to tile
  /*
  getDist(n) {
    let queue1 = [this];
    let queue2 = [];
    let result = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < queue1.length; i++) {
        result.push(queue1[0].id);
        for (let k = 0; k < 6; k++) {
          if (
            queue1.connections[k] != -1 &&
            result.indexOf(queue1.connections[k]) == -1
          )
            if (tileByID(queue1.connections[k]).unit == null)
              queue2.push(tileByID(queue1.connections[k]));
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) queue1.push(queue2[j]);
      queue2 = [];
    }
    return result;
  }*/
}

module.exports = Tile;
