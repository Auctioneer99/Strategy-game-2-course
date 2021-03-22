//let action = require("./action.js");
//let skill = require("./skill.js");
//let effect = require("./effects.js");

class PlaygroundObject {
  _id;
  _name;
  _currentHealth;
  _maxHealth;
  _originalHealth;

  constructor(id, name) {
    this._id = id;
    this._name = name;
  }
  //#region Get and Set
  get Id() {
    return this._id;
  }
  get Name() {
    return this._name;
  }
  get OriginalHealth() {
    return this._originalHealth;
  }
  get MaxHealth() {
    return this._maxHealth;
  }
  set MaxHealth(value) {
    if (this.currentHealth > value) {
      this.CurrentHealth = value;
    }
    this.MaxHealth = value;
  }
  get CurrentHealth() {
    return this._currentHealth;
  }
  set CurrentHealth(value) {
    if (CurrentHealth > value) {
      this.dispathEvent(new CustomEvent("HealthDecreased", { target: this }));
    }
    if (CurrentHealth < value) {
      this.dispathEvent(new CustomEvent("HealthIncreased", { target: this }));
    }
    this._currentHealth = value;
  }
  //#endregion Get and Set
  ApplyDamage(damage, attacker) {
    CurrentHealth -= damage;
    this.dispathEvent(new CustomEvent("DamageTaken", { target: this }));
  }
  toString() {
    return this.Name + " " + this.Id;
  }
}

class Peasant extends PlaygroundObject {
  constructor(id, name) {
    super(id, name);
  }
}

class BloodPriest extends PlaygroundObject {
  constructor(id, name) {
    super(id, name);
    this.Initialize();
  }
  Initialize() {
    this.AddEventListener("DamageTaken");
  }
}

class PlaygroundObject {
  constructor(id, session, side, health = 1) {
    this.session = session;
    this.id = id;
    this.side = side;
    this.tile = null;
    this.originHealth = health;
    this.health = this.originHealth;
    this.currentHealth = this.originHealth;
    this.effects = [];
  }
  remove() {
    this.tile.unit = null;
    this.session.removeUnit(this.id);
    this.deathHandler();
  }
  isExist() {
    return this.currentHealth > 0;
  }
  appearanceHandler() {
    console.log("Появление юнита " + this.name);
  }
  deathHandler() {}
  /*---------------EFFECTS---------------------*/
  addEffect(effect) {
    this.effects.push(effect);
    this.session.persons.emit(
      "addEffect",
      this.session.effectToSend(effect),
      this.id
    );
  }
  refreshEffects() {
    for (let i = 0; i < this.effects.length; i++) this.effects[i].use();
  }
  applyDamage(damage, attacker, ability) {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.session.persons.emit("takeDmgUnit", damage, attacker.id, this.id);
    if (this.currentHealth == 0) {
      console.log(
        `  ${attacker.name} убивает ${this.name}` +
          (ability ? " с помощью " + ability.name : "")
      );
      this.session.persons.emit("kill", attacker.id, this.id);
      this.remove();
    }
  }
  applyDamageFromEffect(damage, effect) {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.session.persons.emit("takeDmgEffect", damage, effect.name);
    if (this.currentHealth == 0) {
      console.log(`  ${effect.name} убивает ${this.name}`);
      this.session.persons.emit("kill", effect.name, this.id);
      this.remove();
    }
  }
}

class Unit extends PlaygroundObject {
  constructor(
    id,
    session,
    side,
    health = 1,
    attack = 1,
    moves = 1,
    initiative = 1
  ) {
    super(id, session, side, health);
    this.originAttack = attack;
    this.currentAttack = this.originAttack;
    this.originMoves = moves;
    this.moves = this.originMoves;
    this.currentMoves = this.originMoves;
    this.originInitiative = initiative;
    this.currentInitiative = this.originInitiative;
    this.canCounterAttack = true;
    this.canWait = true;
    this.abilities = [
      new skill.Move(this),
      null,
      new skill.CounterAttack(this),
      new skill.Fortify(this),
      new skill.Wait(this),
      null,
      null,
      null,
    ];
  }
  /*--------------------ACTIONS-------------------------*/
  useAbility(abilityID, tileID) {
    if (!this.hasAbility(abilityID)) return;
    this.session.actionQueue.addAction(
      new action.Action(
        { unit: this, abilityID: abilityID, tileID: tileID },
        function (params) {
          !params.unit.abilities[params.abilityID].use(params.tileID);
        }
      )
    );
  }
  /*--------------------ORDERS-----------------*/
  setPosition(tile) {
    this.tile.unit = null;
    this.tile = tile;
    tile.unit = this;
  }
  startTurn() {
    this.refreshEffects();
    this.refreshAbilities();
  }
  endTurn() {
    this.currentMoves = 0;
    this.session.persons.emit("endTurn");
    this.session.nextTurn();
  }
  refreshMoves() {
    this.currentMoves = this.moves;
  }
  /*----------------ABILITIES-------------*/
  refreshAbilities() {
    for (let i = 0; i < this.abilities.length; i++)
      if (this.abilities[i]) this.abilities[i].refreshReload();
  }
  hasAbility(abilityID) {
    if (typeof abilityID !== "number") return false;
    return this.abilities[abilityID];
  }
}

class Ranged extends Unit {
  constructor(
    id,
    session,
    side,
    health = 1,
    attack = 1,
    moves = 1,
    initiative = 1
  ) {
    super(id, session, side, health, attack, moves, initiative);
    this.ranged = true;
    this.abilities[1] = new skill.RangeAttack(this);
  }
}
class Melee extends Unit {
  constructor(
    id,
    session,
    side,
    health = 1,
    attack = 1,
    moves = 1,
    initiative = 1
  ) {
    super(id, session, side, health, attack, moves, initiative);
    this.ranged = false;
    this.abilities[1] = new skill.MeleeAttack(this);
  }
}
class Healer extends Ranged {
  constructor(id, session, side) {
    super(id, session, side, 20, 3, 2, 3);
    this.name = "Healer";
    this.abilities[0] = new skill.Sprint(this);
  }
}
class Alchemist extends Ranged {
  constructor(id, session, side) {
    super(id, session, side, 20, 3, 2, 3);
    this.name = "Alchemist";
  }
  appearanceHandler() {
    this.addEffect(new effect.Poison(this));
  }
}
class Archer extends Ranged {
  constructor(id, session, side) {
    super(id, session, side, 20, 3, 2, 3);
    this.name = "Archer";
  }
}
class Runner extends Melee {
  constructor(id, session, side) {
    super(id, session, side, 40, 6, 3, 5);
    this.name = "Runner";
    this.abilities[5] = new skill.Sprint(this);
  }
}
class Swordsman extends Melee {
  constructor(id, session, side) {
    super(id, session, side, 100, 6, 3, 5);
    this.name = "Swordsman";
  }
}
class King extends Melee {
  constructor(id, session, side) {
    super(id, session, side, 10, 6, 1, 1);
    this.name = "King";
  }
  deathHandler() {
    this.session.closeSession(this.side);
  }
}
class Mage extends Ranged {
  constructor(id, session, side) {
    super(id, session, side, 40, 6, 2, 6);
    this.name = "Mage";
    this.abilities[5] = new skill.Fireball(this);
  }
}
exports.Alchemist = Alchemist;
exports.Mage = Mage;
exports.Runner = Runner;
exports.King = King;
exports.Swordsman = Swordsman;
exports.Archer = Archer;
exports.PlaygroundObject = PlaygroundObject;

/*
          if (tileID) {
            if (params.unit.session.tileByID(params.tileID).unit != null)
              console.log(
                "   Использование способности " +
                  params.unit.abilities[abilityID].name +
                  ", цель: " +
                  params.unit.session.tileByID(params.tileID).unit.name
              );
            else
              console.log(
                "   Использование способности " +
                  params.unit.abilities[abilityID].name +
                  ", цель: тайл " +
                  params.tileID
              );
          } else
            console.log(
              "Использование способности " +
                params.unit.abilities[abilityID].name
            );
          params.unit.abilities[params.abilityID].use(params.tileID);
          */

/*
    this.currentInitiative = this.originInitiative;
    this.moves = this.originMoves;
    this.currentMoves = this.originMoves;
    this.currentAttack = this.originAttack;
    this.health = this.originHealth;
    this.currentHealth = this.originHealth;*/
/*
  attackUnit(tileID) {
    this.session.actionQueue.addAction(
      new action.Action(
        {
          attacker: this,
          attacked: tileID
        },
        function(params) {
          params.attacker.abilities[1].use(tileID);
          /*
          if (!params.attacker.tile.reach(1, params.attacked.tile)) {
            console.log("   Атака невозможна, так как юнит не находится рядом");
            return;
          }

          let dmg = 0;

          dmg = 40;
          console.log(
            `  ${params.attacker.name} наносит ${dmg} урона ${params.attacked.name}`
          );
          params.attacked.applyDamage(dmg, params.attacker);
          params.attacked.counterAttack(params.attacker);
          params.attacker.endTurn();
          
        }
      )
    );
  }
  */
/*
  attackUnit(tile) {
    this.session.actionQueue.addAction(
      new action.Action(
        {
          attacker: this,
          attacked: tile.unit
        },
        function(params) {
          params.attacker.abilities[1].use(tileID);
          
          if (params.attacker.tile.checkZoneControl())
            if (!params.attacker.tile.reach(1, params.attacked.tile)) {
              console.log(
                "   Атака невозможна, так как юнит не находится рядом"
              );
              return;
            } else if (!params.attacker.tile.reach(4, params.attacked.tile)) {
              console.log("   Атака невозможна, так как юнит вне досягаемости");
              return;
            }
          let dmg = 0;

          dmg = 40;
          console.log(
            `  ${params.attacker.name} наносит ${dmg} урона ${params.attacked.name}`
          );
          params.attacked.applyDamage(dmg, params.attacker);
          if (params.attacker.tile.getReach(params.attacked.tile) == 1)
            params.attacked.counterAttack(params.attacker);
          else
            console.log(
              "    Не смог контратаковать так как был слишком далеко"
            );

          params.attacker.endTurn();
          
        }
      )
    );
  }
  */
/*
  move(tileID) {
    this.session.actionQueue.addAction(
      new action.Action({ tileID: tileID, unit: this }, function(params) {
        params.unit.abilities[0].use(tileID);
        /*
        params.unit.setPosition(params.tile);
        params.unit.currentMoves--;
        params.unit.session.persons.emit("confirmedMove", params.tile.id, 1);
        if (params.unit.currentMoves <= 0) params.unit.endTurn();
        
      })
    );
  }
  fortify() {
    this.session.actionQueue.addAction(
      new action.Action({ unit: this }, params => {
        params.unit.session.persons.emit("unitFortify");
        console.log("   Юнит защищается");
        params.unit.endTurn();
      })
    );
  }
  wait() {
    this.session.actionQueue.addAction(new action.Action(null, () => {}));
  }
  counterAttack(unit) {
    if (!this.isExist()) {
      console.log("   Контратака не удалась, так как юнит был убит");
      return;
    }
    if (this.tile.getReach(unit.tile) > 1) {
      console.log("   Юнит не может достать соперника");
      return;
    }
    if (!this.canCounterAttack) {
      console.log("   Юнит уже контатаковал");
      return;
    }
    let dmg = 0;

    dmg = 40;
    console.log(
      `  (Контратака) ${this.name} наносит ${dmg} урона ${unit.name}`
    );
    unit.applyDamage(dmg, this);
    this.canCounterAttack = false;
  }
  */
