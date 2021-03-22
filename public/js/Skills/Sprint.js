class Sprint extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._name = "Sprint";
  }
  get Description() {
    return "Добавляет 2 дополнительных очка действия";
  }
  Choose() {
    if (this.CurrentReload != 0) {
      return;
    }
    this.SendData();
    //this.Unit.ClickHandler();
  }
  SendData() {
    console.log("sending");
    socket.emit("ability", { abilityID: "sprint" });
  }
}
Abilities["Sprint"] = Sprint;
