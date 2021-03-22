class Wait extends Skill {
  constructor(unit, currentreload, reload) {
    super(unit, currentreload, reload);
    this._name = "Wait";
  }
  get Description() {
    return "Подождать";
  }
  Choose() {
    this.SendData();
  }
  SendData() {
    socket.emit("ability", { abilityID: "wait" });
  }
}
Abilities["Wait"] = Wait;
