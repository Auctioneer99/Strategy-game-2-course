class Effect {
  constructor(unit) {
    this.name = "";
    this.duration = 3;
    this.unit = unit;
  }
  use() {
    this.origin();
    this.main();
    this.end();
  }
  origin() {
    this.duration--;
  }
  main() {}
  end() {
    if (this.duration === 0) this.remove();
  }
  remove() {
    //this.unit.Effect
  }
}
class Poison extends Effect {
  constructor(unit) {
    super(unit);
    this.name = "Poison";
  }
  main() {
    this.unit.applyDamageFromEffect(10, this);
  }
}
class Fear extends Effect {
  constructor() {
    super();
    this.factor = 0;
  }
  attach(unit) {
    super.attach(unit);
    unit.initiative -= 2;
    factor = 2;
  }
  remove() {
    super.remove();
    this.unit.initiative += this.factor;
  }
}

exports.Fear = Fear;
exports.Poison = Poison;
