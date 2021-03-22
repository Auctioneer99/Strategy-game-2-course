class Skill {
  constructor(unit, currentreload, reload) {
    this._unit = unit;
    this._currentReload = currentreload;
    this._reload = reload;
  }
  get CurrentReload() {
    return this._currentReload;
  }
  set CurrentReload(value) {
    this._currentReload = value;
  }
  get Reload() {
    return this._reload;
  }
  get Unit() {
    return this._unit;
  }
  get Lobby() {
    return this.Unit.Lobby;
  }
  get Name() {
    return this._name;
  }
  get Description() {
    return "no skill";
  }
  Choose() {}
  SendData() {}
  Unchoose() {
    if (this.Lobby.CurrentAbility != "MoveAttack") {
      this.Lobby.CurrentAbility == "MoveAttack";
    }
  }
}
