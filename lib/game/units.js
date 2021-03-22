const Skill = require("./Skills.js");
const EventSystem = require("./EventSystem.js");

class PlaygroundObject {
  constructor(lobby, side) {
    this._race;
    this._currentHealth;
    this._maxHealth;
    this._originalHealth;
    this._currentAttack;
    this._originalAttack;
    this._currentInitiative = 1;
    this._originalInitiative = 1;
    this._currentMoves;
    this._originalMoves;
    this._maxMoves;
    this._events = new EventSystem();
    this._effects = [];
    this._abilities = [];
    this._abilities["move"] = new Skill.Move(this);
    this._abilities["meleeAttack"] = new Skill.MeleeAttack(this);
    this._abilities["counterAttack"] = new Skill.CounterAttack(this);
    this._abilities["fortify"] = new Skill.Fortify(this);
    this._abilities["wait"] = new Skill.Wait(this);
    /*
    {
      move: new Skill.Move(this),
      melleAttack: new Skill.MeleeAttack(this),
      couterAttack: new Skill.CounterAttack(this),
      fortify: new Skill.Fortify(this),
      wait: new Skill.Wait(this),
    };*/
    this._canCounterAttack = true;
    this._canWait = true;
    this._tile;

    this._ranged = false;
    this._name = "noname";
    this._id = lobby._unitsCounter;
    this._lobby = lobby;
    this._side = side;

    this.OriginalHealth = 100;
    this.OriginalAttack = 20;
    this.OriginalMoves = 2;
  }
  //#region Get and Set
  get Race() {
    return this._race;
  }
  get Events() {
    return this._events;
  }
  get Ranged() {
    return this._ranged;
  }
  get Effects() {
    return this._effects;
  }
  get Abilities() {
    return this._abilities;
  }
  get CanCounterAttack() {
    return this._canCounterAttack;
  }
  set CanCounterAttack(value) {
    this._canCounterAttack = value;
    this.Notify("CanCounterAttack", value);
  }
  get CanWait() {
    return this._canWait;
  }
  set CanWait(value) {
    this._canWait = value;
    this.Notify("CanWait", value);
  }
  get MaxMoves() {
    return this._maxMoves;
  }
  set MaxMoves(value) {
    this.MaxMoves = value;
    this.Notify("MaxMoves", value);
    if (value < this.CurrentMoves) {
      this.CurrentMoves = value;
    }
  }
  get CurrentMoves() {
    return this._currentMoves;
  }
  set CurrentMoves(value) {
    if (value == this._currentMoves) {
      return;
    }
    this._currentMoves = Math.max(value, 0);
    this.DispatchEvent("MovesChanged");
    this.Notify("CurrentMoves", value);
    if (this._currentMoves <= 0) {
      this.EndTurn();
    }
  }
  get OriginalMoves() {
    return this._originalMoves;
  }
  set OriginalMoves(value) {
    this._originalMoves = this._currentMoves = this._maxMoves = value;
    this.Notify("OriginalMoves", value);
    this.Notify("CurrentMoves", value);
    this.Notify("MaxMoves", value);
  }
  get Tile() {
    return this._tile;
  }
  set Tile(value) {
    if (this._tile != null) {
      this._tile.Unit = null;
    }
    this._tile = value;
    value.Unit = this;
    this.DispatchEvent("TileChanged");
    this.Notify("Tile", value.Id);
  }
  get Side() {
    return this._side;
  }
  get CurrentInitiative() {
    return this._currentInitiative;
  }
  set CurrentInitiative(value) {
    this._currentInitiative = value;
    this.DispatchEvent("InitiativeChanged");
    this.Notify("CurrentInitiative", value);
  }
  get OriginalInitiative() {
    return this._originalInitiative;
  }
  set OriginalInitiative(value) {
    this._originalInitiative = this._currentInitiative = value;
    this.Notify("OriginalInitiative", value);
    this.Notify("CurrentInitiative", value);
  }
  get CurrentAttack() {
    return this._currentAttack;
  }
  set CurrentAttack(value) {
    this._currentAttack = value;
    this.DispatchEvent("AttackChanged");
    this.Notify("CurrentAttack", value);
  }
  get OriginalAttack() {
    return this._originalAttack;
  }
  set OriginalAttack(value) {
    this._currentAttack = this._originalAttack = value;
    this.Notify("CurrentAttack", value);
    this.Notify("OriginalAttack", value);
  }
  get Lobby() {
    return this._lobby;
  }
  get Id() {
    return this._id;
  }
  get Name() {
    return this._name;
  }
  get CurrentHealth() {
    return this._currentHealth;
  }
  set CurrentHealth(value) {
    if (this.CurrentHealth <= 0) {
      return;
    }
    if (this._currentHealth > value) {
      this._currentHealth = Math.max(0, value);
      this.DispatchEvent("HealthDecreased");
    }
    if (this._currentHealth < value) {
      this._currentHealth = Math.min(this.MaxHealth, value);
      this.DispatchEvent("HealthIncreased");
    }
    this.Notify("CurrentHealth", this._currentHealth);
    if (this._currentHealth <= 0) {
      this.Destroy();
    }
  }
  get OriginalHealth() {
    return this._originalHealth;
  }
  set OriginalHealth(value) {
    this._originalHealth = this._maxHealth = this._currentHealth = value;
    this.Notify("OriginalHealth", value);
    this.Notify("MaxHealth", value);
    this.Notify("CurrentHealth", value);
  }
  get MaxHealth() {
    return this._maxHealth;
  }
  set MaxHealth(value) {
    if (this.currentHealth > value) {
      this.CurrentHealth = value;
    }
    this._maxHealth = value;
    this.Notify("MaxHealth", value);
  }
  //#endregion Get and Set
  UseAbility(data) {
    if (!this.Abilities[data.abilityID]) {
      return;
    }
    this.Abilities[data.abilityID].Use(data.data);
  }
  Notify(attribute, value) {
    this.Lobby.Notify({
      attribute: attribute,
      value: value,
      path: ["Units", this.Id],
    });
  }
  Initialize() {
    console.log(this.toString() + " initialized");
  }
  Destroy() {
    this.Tile.Unit = null;
    this.Lobby.RemoveUnit(this);
    this.DispatchEvent("Dead");
  }
  ApplyDamage(damage, attacker) {
    this.CurrentHealth -= damage;
    this.DispatchEvent("DamageTaken");
  }
  Attack(target) {
    target.ApplyDamage(this.CurrentAttack);
  }
  DispatchEvent(eventName) {
    this.Lobby.Events.DispatchEvent(eventName, this);
    this.Events.DispatchEvent(eventName, this);
  }
  NewRound() {
    this.Moves = this.MaxMoves;
    this.Abilities.forEach((a) => a.NewRound());
    this.Effects.forEach((e) => e.NewRound());
    this.CanWait = true;
    this.CanCounterAttack = true;
  }
  EndTurn() {
    if (this.CurrentMoves != 0) {
      this.CurrentMoves = 0;
      return;
    }
    this.DispatchEvent("UnitEndTurn");
    this.Lobby.RemoveFromQueue(this);
  }
  RefreshSkills() {
    for (let a in this.Abilities) {
      if (this.Abilities[a] != null) {
        this.Abilities[a].RefreshReload();
      }
    } /*
                    this.Abilities.keys.forEach((a) => {
                      console.log(a);
                      let ab = this.Abilities[a];
                      if (ab != null) {
                        ab.RefreshReload();
                      }
                    });*/
  }
  toString() {
    return this.Name + " " + this.Id + " for " + this.Side;
  }
  StylizeUnit() {
    return `<span style='color:${
      this.Side == "Yellow" ? "Yellow" : "Red"
    };'onmouseover='lightUnit(${this.Id})' onclick='showInfo(${
      this.Id
    })' onmouseout='delightUnit(${this.Id})'>${this.Name}</span>`;
  }
}

//region Human
class Human extends PlaygroundObject {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._race = "Human";
  }
}

class Peasant extends Human {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Peasant";
    this.Initialize();
  }
}

class Scout extends Human {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Scout";
    this._abilities["sprint"] = new Skill.Sprint(this);
    this._currentInitiative = 4;
    this.Initialize();
  }
}

class King extends Human {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "King";
    this.Initialize();
  }
  Initialize() {
    this.Events.AddEventListener("Dead", () => this.Lobby.End(this.Side));
  }
}

class Mage extends Human {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Mage";
    this._abilities["fireball"] = new Skill.Fireball(this);
    this._currentInitiative = 5;
    this.Initialize();
  }
}
//end region Human

//region Undead
class Undead extends PlaygroundObject {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._race = "Undead";
    this.OriginalHealth = 80;
    this.OriginalAttack = 30;
  }
  Initialize() {
    super.Initialize();
    this.Lobby.Events.AddEventListener("Dead", (target) => {
      if (target.Race != "Undead") {
        this.CurrentHealth += 10;
      }
    });
  }
}

class SkeletonArcher extends Undead {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Ranger";
    this._ranged = true;
    this._abilities["rangeAttack"] = new Skill.RangeAttack(this);
    this.Initialize();
  }
}

class Skeleton extends Undead {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Swordsman";
    this.Initialize();
  }
}

class SkeletonKing extends Undead {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "King";
    this._currentInitiative = 0;
    this.Initialize();
  }
  Initialize() {
    this.Events.AddEventListener("Dead", () => this.Lobby.End(this.Side));
  }
}
//endregion Undead

//region Elves
class Elves extends PlaygroundObject {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._race = "Elves";
    this.OriginalHealth = 120;
  }
  Initialize() {
    super.Initialize();

    this.Lobby.Events.AddEventListener("Dead", (target) => {
      if (target.Race == "Elves" && target.Side == this.Side) {
        this.CurrentHealth -= 10;
      }
    });
  }
}

class Trapper extends Elves {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Trapper";
    this._abilities["trap"] = new Skill.Trap(this);
    this.Initialize();
  }
}

class ElfKing extends Elves {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "King";
    this._currentInitiative = 0;
    this.Initialize();
  }
  Initialize() {
    super.Initialize();
    this.Events.AddEventListener("Dead", () => this.Lobby.End(this.Side));
  }
}

class Ranger extends Elves {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Ranger";
    this._ranged = true;
    this._abilities["rangeAttack"] = new Skill.RangeAttack(this);
    this.Initialize();
  }
}

class Druid extends Elves {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Druid";
    this._ranged = true;
    this._abilities["rangeAttack"] = new Skill.RangeAttack(this);
    this._abilities["summonBear"] = new Skill.SummonBear(this);
    this.Initialize();
  }
}

class Bear extends Elves {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Bear";
    this.Initialize();
  }
}
//endregion Elves
class BloodPriest extends PlaygroundObject {
  constructor(id, lobby, side, tile) {
    super(id, lobby, side, tile);
    this._name = "Blood Priest";
    this.Initialize();
  }
  Initialize() {
    super.Initialize();
    this.Lobby.Events.AddEventListener("DamageTaken", (target) => {
      if (target == this) {
        return;
      }
      this.CurrentHealth += 20;
    });
  }
}

module.exports.BloodPriest = BloodPriest;

module.exports.Peasant = Peasant;
module.exports.King = King;
module.exports.Scout = Scout;
module.exports.Mage = Mage;

module.exports.SkeletonArcher = SkeletonArcher;
module.exports.Skeleton = Skeleton;
module.exports.SkeletonKing = SkeletonKing;

module.exports.Ranger = Ranger;
module.exports.Trapper = Trapper;
module.exports.ElfKing = ElfKing;
module.exports.Druid = Druid;
module.exports.Bear = Bear;
