class Fireball extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._range = 4;
    this._name = "Fireball";
  }
  get Range() {
    return this._range;
  }
  get Description() {
    return "Наносит 50 урона персонажу в выбраной клетке, юнит заканчивает ход";
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
      abilityID: "fireball",
      data: this.Lobby.CurrentTile.Id,
    });
  }
}
Abilities["Fireball"] = Fireball;
