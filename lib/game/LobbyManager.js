const Lobby = require("./Lobby.js");
const Units = require("./units.js");
class LobbyManager {
  constructor(io) {
    this._lobbys = [];
    this._io = io;
  }
  get Io() {
    return this._io;
  }
  get Lobbys() {
    return this._lobbys;
  }
  AddLobby(name) {
    let l = new Lobby(name, this.Io, this);
    /*
    l.AddUnit(new Units.King(l, "Red", l.Tiles[31]));
    l.AddUnit(new Units.Peasant(l, "Red", l.Tiles[32]));
    l.AddUnit(new Units.Peasant(l, "Red", l.Tiles[21]));
    l.AddUnit(new Units.Peasant(l, "Red", l.Tiles[42]));
    l.AddUnit(new Units.Scout(l, "Red", l.Tiles[0]));
    l.AddUnit(new Units.Mage(l, "Red", l.Tiles[10]));
    l.AddUnit(new Units.Ranger(l, "Red", l.Tiles[13]));*/
    l.AddUnit(new Units.ElfKing(l, "Red"), l.Tiles[31]);
    l.AddUnit(new Units.Trapper(l, "Red"), l.Tiles[32]);
    l.AddUnit(new Units.Trapper(l, "Red"), l.Tiles[21]);
    l.AddUnit(new Units.Ranger(l, "Red"), l.Tiles[42]);
    l.AddUnit(new Units.Ranger(l, "Red"), l.Tiles[0]);
    l.AddUnit(new Units.Druid(l, "Red"), l.Tiles[10]);
    l.AddUnit(new Units.Ranger(l, "Red"), l.Tiles[63]);

    l.AddUnit(new Units.SkeletonKing(l, "Yellow"), l.Tiles[41]);
    l.AddUnit(new Units.SkeletonArcher(l, "Yellow"), l.Tiles[9]);
    l.AddUnit(new Units.SkeletonArcher(l, "Yellow"), l.Tiles[20]);
    l.AddUnit(new Units.Skeleton(l, "Yellow"), l.Tiles[40]);
    l.AddUnit(new Units.Skeleton(l, "Yellow"), l.Tiles[30]);
    l.AddUnit(new Units.Skeleton(l, "Yellow"), l.Tiles[51]);
    l.AddUnit(new Units.SkeletonArcher(l, "Yellow"), l.Tiles[72]);

    /*
    l.AddUnit(new Units.Ranger(l, "Yellow", l.Tiles[15]));
    l.AddUnit(new Units.King(l, "Yellow", l.Tiles[41]));
    l.AddUnit(new Units.Scout(l, "Yellow", l.Tiles[9]));
    l.AddUnit(new Units.Mage(l, "Yellow", l.Tiles[20]));
    l.AddUnit(new Units.Peasant(l, "Yellow", l.Tiles[40]));
    l.AddUnit(new Units.Peasant(l, "Yellow", l.Tiles[30]));
    l.AddUnit(new Units.Peasant(l, "Yellow", l.Tiles[51]));
    */
    //l.AddUnit(new Units.Ranger(l, "Red", l.Tiles[59]));
    l.Start();
    this.Lobbys.push(l);
  }
  LobbyByName(name) {
    for (let i = 0; i < this.Lobbys.length; i++) {
      let l = this.Lobbys[i];
      if (l.Name == name) {
        return l;
      }
    }
    return null;
  }
  CloseLobby(lobby) {
    for (let i = 0; i < this.Lobbys.length; i++) {
      if (this.Lobbys[i] == lobby) {
        this.Lobbys.splice(i, 1);
      }
    }
  }
}

module.exports = LobbyManager;
