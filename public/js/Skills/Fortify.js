class Fortify extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._name = "Fortify";
  }
  get Description() {
    return "Укрепиться, восстановив немного здоровья, юнит заканчивает ход";
  }
  Choose() {
    this.SendData();
    //this.Unit.ClickHandler();
  }
  SendData() {
    console.log("sending");
    socket.emit("ability", { abilityID: "fortify" });
  }
}
Abilities["Fortify"] = Fortify;
