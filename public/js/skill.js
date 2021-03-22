class Skill {
  constructor(unitID, id, reload) {
    this.id = id;
    this.unitID = unitID;
    this.reload = 3;
    this.currentReload = reload ? reload : 0;
    this.targeting = false;
    this.cost = -1;
  }
  active() {
    this.use();
  }
  deactive() {}
  use(aim) {
    if (this.check()) socket.emit("ability", this.id, aim);
  }
  check() {
    if (this.currentReload !== 0) return false;
    return true;
  }
  approved() {
    console.log("approved");
    this.currentReload = this.reload;
    if (this.cost === -1) playground.currentUnit.stats.currentMoves = 0;
    else playground.currentUnit.stats.currentMoves -= this.cost;
  }
}

class Sprint extends Skill {
  constructor(unitID, id, reload) {
    super(unitID, id);
    this.name = "Sprint";
    this.reload = 3;
    this.cost = 0;
  }
  approved() {
    playground.currentUnit.stats.currentMoves += 2;
    playground.createMoves(unitByID(this.unitID));
    super.approved();
  }
}

class Fireball extends Skill {
  constructor(unitID, id, reload) {
    super(unitID, id);
    this.name = "Fireball";
    this.reload = 3;
    this.targeting = true;
    this.range = 3;
  }
  active() {
    //show targets
  }
  deactive() {
    //show moves
  }
  check() {
    if (aim == null) return false;
    super.check();
  }
}

class MeleeAttack extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this.name = "MeleeAttack";
    this.reload = 1;
    this.targeting = true;
    this.range = 1;
  }
  check(tile) {
    if (!super.check()) return false;
    if (!this.unit.tile.reach(this.range, tile)) return false;
    if (tile.unit === null) return false;
    if (this.unit.side === tile.unit.side) return false;
    return true;
  }
  main(tile) {
    // calculating dmg
    let dmg = 30;
    tile.unit.applyDamage(dmg, this.unit, this);
    if (tile.unit) tile.unit.abilities[2].use(this.unit.tile.id);
  }
}
class CounterAttack extends MeleeAttack {
  constructor(unit, id) {
    super(unit, id);
    this.name = "CounterAttack";
  }
  main(tile) {
    // calculating dmg
    let dmg = 30;
    tile.unit.applyDamage(dmg, this.unit, this);
  }
}
class RangeAttack extends MeleeAttack {
  constructor(unit, id) {
    super(unit, id);
    this.name = "RangeAttack";
    this.range = 4;
  }
}
class Move extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this.name = "Move";
    this.reload = 0;
    this.targeting = true;
    this.cost = 1;
    this.range = 1;
  }
  check(tile) {
    if (!super.check()) return false;
    if (!this.unit.tile.reach(this.range, tile)) return false;
    if (tile.unit !== null) return false;
    return true;
  }
  main(tile) {
    tile.unit = this.unit;
    this.unit.tile.unit = null;
    this.unit.tile = tile;
  }
}
class Fortify extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this.name = "Fortify";
    this.reload = 1;
    this.targeting = false;
    this.cost = -1;
  }
  main() {
    this.unit.currentHealth = Math.min(
      this.unit.currentHealth + 5,
      this.unit.health
    );
  }
}
class Wait extends Skill {
  constructor(unit, id) {
    super(unit, id);
    this.name = "Wait";
    this.reload = 1;
    this.targeting = false;
    this.cost = -1;
  }
  main() {
    //Do logic
  }
}
let aim = null;
let skills = {};
skills.RangeAttack = RangeAttack;
skills.CounterAttack = CounterAttack;
skills.Move = Move;
skills.Fortity = Fortify;
skills.Wait = Wait;
skills.MeleeAttack = MeleeAttack;
skills.Sprint = Sprint;
skills.Fireball = Fireball;
