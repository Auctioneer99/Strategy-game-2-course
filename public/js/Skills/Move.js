class Move extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
  }
  get Description() {
    return "";
  }
  Choose() {}
}
Abilities["Move"] = Move;
