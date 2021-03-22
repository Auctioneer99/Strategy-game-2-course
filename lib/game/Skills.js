const Units = require("./units.js");
class Skill {
  constructor(unit) {
    this._unit = unit;
    this._img = "";
    this._reload = 3;
    this._currentReload = 0;
    this._cost = -1;
    this._name;
    this._targeting = false;
    this._toAlly = false;
    this._toEnemy = false;
    this._range = 0;
  }
  get Targeting() {
    return this._targeting;
  }
  get ToAlly() {
    return this._toAlly;
  }
  get ToEnemy() {
    return this._toEnemy;
  }
  get Name() {
    return this._name;
  }
  get Unit() {
    return this._unit;
  }
  get Img() {
    return this._img;
  }
  get Reload() {
    return this._reload;
  }
  get CurrentReload() {
    return this._currentReload;
  }
  set CurrentReload(value) {
    this._currentReload = value;
    this.Notify("CurrentReload", value);
  }
  get Cost() {
    return this._cost;
  }
  get Range() {
    return this._range;
  }
  get IsReloading() {
    return this.CurrentReload != 0;
  }
  get Lobby() {
    return this.Unit.Lobby;
  }
  Notify(attribute, value) {
    this.Lobby.Notify({
      attribute: attribute,
      value: value,
      path: ["Units", this.Unit.Id, "Abilities", this.Name],
    });
  }
  Log(data) {
    this.Lobby.Log(data);
  }
  RefreshReload() {
    this.CurrentReload = Math.max(this.CurrentReload - 1, 0);
  }
  Use(data) {
    data = this.FormatData(data);
    if (data) {
      if (this.Check(data)) {
        this.CurrentReload = this.Reload;
        console.log("Применение способности " + this.Name);
        this.Main(data);
      }
    }
  }
  FormatData() {
    return true;
  }
  CheckTile(tile) {
    if (this.IsReloading) {
      return false;
    }
    if (this.ToAlly || this.ToEnemy) {
      if (!tile.Unit) {
        return false;
      }
      if (this.ToAlly != this.ToEnemy) {
        if (this.ToAlly) {
          if (tile.Unit.Side !== this.Unit.Side) {
            return false;
          }
        }
        if (this.ToEnemy) {
          if (tile.Unit.Side === this.Unit.Side) {
            return false;
          }
        }
      }
    }
    if (this.Targeting) {
      if (!this.ToAlly && !this.ToEnemy) {
        return tile.Unit ? false : true;
      }
    }
    return true;
  }
  Check() {
    return !this.IsReloading;
  }
  Main() {
    this.ReduceMoves();
  }
  ReduceMoves() {
    if (this.Cost === -1) {
      this.Unit.EndTurn();
    } else {
      this.Unit.CurrentMoves -= this.Cost;
    }
  }
  StylizeSkill() {
    return this.Name;
  }
}

class Wait extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Wait";
    this._reload = 1;
    this._cost = 0;
  }
  Main() {
    let t = this.Lobby.Queue;
    t.splice(t.indexOf(this.Unit), 1);
    this.Lobby.Queue = t;
    t.push(this.Unit);
    this.Lobby.Queue = t;
  }
}
class Trap extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Trap";
    this._reload = 3;
    this._cost = -1;
    this._range = 2;
    this._toAlly = false;
    this._toEnemy = false;
  }
  Check(tile) {
    return super.Check() && tile.Unit == null;
  }
  Main(tile) {
    let f = (value) => {
      if (value != null) {
        value.CurrentHealth -= 20;
        this.Lobby.Log(
          value.StylizeUnit() + " falls into a trap and end his turn"
        );
        tile.Events.RemoveEventListener("Unit", "Trap");
        value.EndTurn();
      }
    };
    tile.Events.AddEventListener("Unit", f, "Trap");
    this.ReduceMoves();
    this.Lobby.Log(this.Unit.StylizeUnit() + " uses " + this.StylizeSkill());
  }
  FormatData(tile) {
    return this.Lobby.Tiles[tile];
  }
}

class SummonBear extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Summon Bear";
    this._reload = 3;
    this._cost = -1;
    this._range = 2;
    this._toAlly = false;
    this._toEnemy = false;
  }
  Check(tile) {
    return super.Check() && tile.Unit == null;
  }
  Main(tile) {
    let b = new Units.Bear(this.Lobby, this.Unit.Side);
    this.Lobby.AddUnit(b, tile);
    this.Lobby.Log(this.Unit.StylizeUnit() + " summons " + b.StylizeUnit());
    this.ReduceMoves();
  }
  FormatData(tile) {
    return this.Lobby.Tiles[tile];
  }
}

class Sprint extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Sprint";
    this._reload = 3;
    this._cost = 0;
  }
  Main() {
    this.Unit.CurrentMoves += 2;
    this.Log(this.Unit.StylizeUnit() + " uses " + this.StylizeSkill());
    this.ReduceMoves();
  }
}

class Move extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Move";
    this._reload = 0;
    this._targeting = true;
    this._cost = 1;
    this._range = 1;
  }
  Check(data) {
    if (data.length > this.Unit.CurrentMoves) {
      return false;
    }
    let from = this.Unit.Tile;
    for (let i = 0; i < data.length; i++) {
      let t = data[i];
      if (
        t &&
        t.Unit === null &&
        this.CheckTile(t) &&
        from.IsInRange(this.Range, t)
      ) {
        from = t;
      } else {
        return false;
      }
    }
    return true;
  }
  FormatData(data) {
    if (!Array.isArray(data)) {
      return false;
    }
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] == "number" && data[i] >= 0) {
        result.push(this.Lobby.Tiles[data[i]]);
      } else {
        return false;
      }
    }
    return result;
  }
  Main(data) {
    for (let i = 0; i < data.length; i++) {
      if (this.Unit.CurrentMoves > 0 && this.Lobby.CurrentUnit == this.Unit) {
        this.Unit.Tile = data[i];
        //this.Log(this.Unit.StylizeUnit() + " moved to tile " + data[i].Id);
        if (this.Lobby.CurrentUnit == this.Unit) {
          this.ReduceMoves();
        }
      } else {
        break;
      }
    }
  }
}

class Fireball extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Fireball";
    this._reload = 3;
    this._targeting = true;
    this._range = 3;
    this._toEnemy = true;
    this._toAlly = true;
  }
  FormatData(data) {
    if (data < -1) {
      return false;
    }
    return this.Lobby.Tiles[data];
  }
  Сheck(data) {
    //if (!data.Unit) {
    //  return false;
    //}
    if (!this.Unit.Tile.IsInReach(this.Range, data)) {
      return false;
    }
    return true;
    /*
    //if (tile.unit === null) return false;
    if (!super.check(tile)) return false;
    if (!this.unit.tile.reach(this.range, tile)) return false;
    return true;*/
  }
  Main(data) {
    this.Log(
      this.Unit.StylizeUnit() +
        " uses " +
        this.StylizeSkill() +
        " on tile " +
        data.Id
    );
    if (data.Unit) {
      data.Unit.ApplyDamage(50, this.Unit, this);
    }
    this.Unit.EndTurn();
  }
}

class Fortify extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this._name = "Fortify";
    this._reload = 1;
    this._cost = -1;
  }
  Main() {
    this.Unit.CurrentHealth += 5;
    this.Log(this.Unit.StylizeUnit() + " fortify");
    this.ReduceMoves();
  }
}

class MeleeAttack extends Skill {
  constructor(unit) {
    super(unit);
    this._name = "MeleeAttack";
    this._reload = 1;
    this._targeting = true;
    this._range = 1;
    this._toEnemy = true;
  }
  Check(tile) {
    if (!this.Unit.Tile.IsInRange(this.Range, tile)) {
      return false;
    }
    return tile.Unit !== null && this.CheckTile(tile);
  }
  Main(tile) {
    // calculating dmg
    let dmg = this.Unit.CurrentAttack;
    this.Lobby.Log(
      this.Unit.StylizeUnit() +
        " attacked " +
        tile.Unit.StylizeUnit() +
        " for " +
        dmg +
        " dmg"
    );
    tile.Unit.ApplyDamage(dmg, this.Unit, this);
    this.ReduceMoves();
    if (tile.Unit) {
      tile.Unit.Abilities["counterAttack"].Use(this.Unit.Tile.Id);
    }
  }
  FormatData(data) {
    if (typeof data != "number" || data < 0) {
      return false;
    }
    return this.Lobby.Tiles[data];
  }
}

class CounterAttack extends MeleeAttack {
  constructor(unit) {
    super(unit);
    this._name = "CounterAttack";
  }
  Check(tile) {
    if (!this.Unit.Tile.IsInRange(this.Range, tile)) {
      return false;
    }
    return tile.Unit !== null && this.CheckTile(tile);
  }
  Main(tile) {
    this.Unit.CanCounterAttack = false;
    let dmg = this.Unit.CurrentAttack;
    this.Lobby.Log(
      this.Unit.StylizeUnit() +
        " counter - attacked " +
        tile.Unit.StylizeUnit() +
        " for " +
        dmg +
        " dmg"
    );
    tile.Unit.ApplyDamage(dmg, this.Unit, this);
  }
}

class RangeAttack extends MeleeAttack {
  constructor(unit) {
    super(unit);
    this._name = "RangeAttack";
    this._range = 4;
  }
  Check(tile) {
    if (!super.Check(tile)) {
      return false;
    }
    return !this.Unit.Tile.CheckZoneControl();
  }
}

module.exports.Wait = Wait;
module.exports.Fortify = Fortify;
module.exports.Move = Move;
module.exports.RangeAttack = RangeAttack;
module.exports.MeleeAttack = MeleeAttack;
module.exports.CounterAttack = CounterAttack;
module.exports.Sprint = Sprint;
module.exports.Fireball = Fireball;
module.exports.Trap = Trap;
module.exports.SummonBear = SummonBear;
