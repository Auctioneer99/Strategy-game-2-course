class MoveAttack extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._name = "MoveAttack";
  }
  get Description() {
    return "";
  }
  Choose() {
    this.Unit.CurrentAbility = this.Name;
    if (this.Lobby.Side == this.Unit.Side) {
      let res = this.Unit.Tile.CreateRange();
      if (this.Unit.Abilities["RangeAttack"]) {
        let arr = this.Unit.Tile.GetAbsDistUnits(
          4,
          this.Unit.Side == "Yellow" ? "Red" : "Yellow"
        );
        arr.forEach((i) => {
          if (res.indexOf(i) == -1) {
            res.push(i);
          }
        });
      }
      this.Lobby.MarkedTiles = res;
    } else {
      this.Lobby.MarkedTiles = [];
    }
  }
  SendData() {
    let attack = null;
    if (this.Unit.Lobby.PathPoints.length == 0) {
      return;
    }
    let temp = [];
    this.Unit.Lobby.PathPoints.forEach((t) => {
      temp.push(t);
    });
    if (temp[0].Unit != null) {
      attack = temp.shift();
    }
    if (!attack) {
      if (temp.length > 0) {
        socket.emit("ability", {
          abilityID: "move",
          data: Array.from(temp.reverse(), (t) => t.Id),
        });
      }
    } else {
      if (this.Unit.Ranged) {
        if (!this.Unit.Tile.ZoneControl()) {
          socket.emit("ability", {
            abilityID: "rangeAttack",
            data: attack.Id,
          });
        }
      } else {
        if (temp.length > 0) {
          socket.emit("ability", {
            abilityID: "move",
            data: Array.from(temp.reverse(), (t) => t.Id),
          });
        }
      }
      socket.emit("ability", { abilityID: "meleeAttack", data: attack.Id });
    }
  }
}
