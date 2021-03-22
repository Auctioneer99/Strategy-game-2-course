class SummonBear extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._range = 2;
    this._name = "Summon Bear";
  }
  get Range() {
    return this._range;
  }
  get Description() {
    return "Призывает медведя в выбранную клетку";
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
      abilityID: "summonBear",
      data: this.Lobby.CurrentTile.Id,
    });
  }
}
Abilities["Summon Bear"] = SummonBear;
