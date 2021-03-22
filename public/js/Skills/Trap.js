class Trap extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._range = 2;
    this._name = "Trap";
  }
  get Range() {
    return this._range;
  }
  get Description() {
    return "Ставит ловушку в выбранную клетку в выбранную клетку";
  }
  Choose() {
    if (this.CurrentReload != 0) {
      return;
    }
    this.Unit.CurrentAbility = this.Name;
    this.Lobby.MarkedTiles = this.Unit.Tile.GetAbsDist(this.Range, false);
  }
  SendData() {
    socket.emit("ability", {
      abilityID: "trap",
      data: this.Lobby.CurrentTile.Id,
    });
  }
}
Abilities["Trap"] = Trap;
