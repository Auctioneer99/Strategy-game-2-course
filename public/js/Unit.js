class Unit {
  constructor(data, lobby) {
    this._id = data.id;
    this._name = data.name;
    this._originalHealth = data.originalHealth;
    this._maxHealth = data.maxHealth;
    this._currentHealth = data.currentHealth;
    this._originalAttack = data.originalAttack;
    this._currentAttack = data.currentAttack;
    this._originalMoves = data.originalMoves;
    this._maxMoves = data.maxMoves;
    this._currentMoves = data.currentMoves;
    this._originalInitiative = data.originalInitiative;
    this._currentInitiative = data.currentInitiative;
    this._canCounterAttack = data.canCounterAttack;
    this._canWait = data.canWait;
    this._ranged = data.ranged;
    this._lobby = lobby;
    this._tile;
    this._race = data.race;
    this._mesh = this.Lobby.UnitGeometry.clone();
    this.Mesh.children[0].material = materials[data.race];
    if (data.tile != -1) {
      this.Tile = this.Lobby.Tiles[data.tile];
    }
    this._side = data.side;

    this._queueItem = document.createElement("div");
    this._queueItem.classList.add("queue_item");
    this._queueItem.classList.add(this.Side == "Yellow" ? "Yellow" : "Red");
    this._queueItem.id = "ux" + this.Id;
    this._queueItem.addEventListener("click", () => showInfo(this.Id));
    this._queueItem.addEventListener("mouseover", () => lightUnit(this.Id));
    this._queueItem.addEventListener("click", () => showInfo(this.Id));
    this._queueItem.addEventListener("mouseout", () => delightUnit(this.Id));
    this._queueItem.innerHTML = "<img src=textures/" + this.Name + ".png>";
    this._size = 1.5;
    this.Mesh.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(
          font.generateShapes(this.CurrentAttack.toString(), this._size)
        ),
        COLOR_ATTACK
      )
    );
    this.Mesh.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(
          font.generateShapes(this.CurrentHealth.toString(), this._size)
        ),
        COLOR_HEALTH
      )
    );
    this.Mesh.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(font.generateShapes("-", this._size)),
        COLOR_INITIATIVE
      )
    );
    this.Mesh.children[2].position.set(-4, 1.15, 3);
    this.Mesh.children[2].rotateX(-Math.PI / 2);
    this.Mesh.children[3].position.set(1, 1.15, 3);
    this.Mesh.children[3].rotateX(-Math.PI / 2);
    this.Mesh.children[4].position.set(-0.5, 1.15, 5);
    this.Mesh.children[4].rotateX(-Math.PI / 2);
    this.Mesh.scale.set(0.75, 0.75, 0.75);
    this.Lobby.Scene.add(this.Mesh);

    this._abilities = [];
    this._abilities["MoveAttack"] = new Abilities["MoveAttack"](this, 0, 0);
    data.abilities.forEach((a) => {
      if (a.name != "CounterAttack") {
        this._abilities[a.name] = new Abilities[a.name](
          this,
          a.currentreload,
          a.reload
        );
      }
    });
    this._currentAbility = "MoveAttack";
  }
  get CurrentAbility() {
    return this._abilities[this._currentAbility];
  }
  set CurrentAbility(value) {
    this._currentAbility = value;
    //this.ShowMoves();
  }
  get Abilities() {
    return this._abilities;
  }
  get Race() {
    return this._race;
  }
  get QueueItem() {
    return this._queueItem;
  }
  get OriginalHealth() {
    return this._originalHealth;
  }
  get MaxHealth() {
    return this._maxHealth;
  }
  get CurrentHealth() {
    return this._currentHealth;
  }
  set CurrentHealth(value) {
    this._currentHealth = value;
    this.GenerateShape(this.Mesh.children[3], this.CurrentHealth);
  }
  get CurrentAttack() {
    return this._currentAttack;
  }
  get OriginalAttack() {
    return this._originalAttack;
  }
  get CurrentInitiative() {
    return this._currentInitiative;
  }
  get OriginalInitiative() {
    return this._originalInitiative;
  }
  get MaxMoves() {
    return this._maxMoves;
  }
  get OriginalMoves() {
    return this._originalMoves;
  }
  get CurrentMoves() {
    return this._currentMoves;
  }
  set CurrentMoves(value) {
    this._currentMoves = value;
    if (this.Lobby.CurrentUnit == this) {
      this.ShowMoves(this);
    }
  }
  get CanCounterAttack() {
    return this._canCounterAttack;
  }
  set CanCounterAttack(value) {
    this._canCounterAttack = value;
  }
  get CanWait() {
    return this._canWait;
  }
  set CanWait(value) {
    this._canWait = value;
  }
  get Ranged() {
    return this._ranged;
  }
  get Id() {
    return this._id;
  }
  get Tile() {
    return this._tile;
  }
  set Tile(value) {
    if (typeof value == "number") {
      value = this.Lobby.Tiles[value];
    }
    this._tile = value;
    value.Unit = this;
    this.Mesh.position.set(value.Mesh.position.x, -0.5, value.Mesh.position.z);
  }
  get Lobby() {
    return this._lobby;
  }
  get Side() {
    return this._side;
  }
  get Mesh() {
    return this._mesh;
  }
  get Name() {
    return this._name;
  }
  ShowSkills() {
    ClearAbility(1);
    ClearAbility(2);
    ClearAbility(3);
    let i = 1;
    for (let a in this.Abilities) {
      if (
        a != "MoveAttack" &&
        a != "MeleeAttack" &&
        a != "Move" &&
        a != "Fortify" &&
        a != "Wait" &&
        a != "RangeAttack"
      ) {
        let d = document.getElementById("ab" + i);
        console.log('<img src="Abilities/' + a + '.png">');
        d.innerHTML = '<img src="Abilities/' + a + '.png">';
        if (this.Lobby.Side == this.Lobby.CurrentUnit.Side) {
          d.onclick = (e) => {
            let t = e.target.tagName == "IMG" ? e.target.parentNode : e.target;
            if (this.CurrentAbility.Name == a) {
              t.style.borderColor = "black";
              this.Abilities["MoveAttack"].Choose();
            } else {
              t.style.borderColor = "green";
              this.Abilities[a].Choose();
            }
          };
        }
        d.onmouseenter = (e) => {
          ShowToolTip(e, this.Abilities[a]);
        };
        d.onmouseleave = () => {
          HideToolTip();
        };
        i++;
      }
    }
  }
  GenerateShape(mesh, text) {
    mesh.geometry = new THREE.ShapeGeometry(
      typeof text == "string"
        ? font.generateShapes(text, this._size)
        : font.generateShapes(text.toString(), this._size)
    );
  }
  Destroy() {
    this.RemoveFromQueue();
    this.Mesh.children[0].geometry.dispose();
    this.Mesh.children[1].geometry.dispose();
    this.Mesh.children[2].geometry.dispose();
    this.Mesh.children[3].geometry.dispose();
    this.Mesh.children[4].geometry.dispose();
    //this.TBox.remove();
    this.Tile.Unit = null;
    this.Lobby.Scene.remove(this.Mesh);
  }
  AddToQueue(n) {
    setTimeout(() => {
      $("#queue").append(this.QueueItem);
      this.QueueItem.style = "";
      move("#" + this.QueueItem.id)
        .ease("snap")
        .x(0)
        .end();
    }, 300);
  }
  RemoveFromQueue() {
    let id = "#" + this.QueueItem.id;
    if (!document.getElementById(id)) {
      return;
    }
    if (this.Lobby.Queue.length == 1) {
      $(id).remove();
    } else {
      move(id)
        .ease("snap")
        .x(80)
        .duration("0.1s")
        .end(() => {
          move(id)
            .set("margin-bottom", -70)
            .duration("0.1s")
            .end(() => {
              $(id).remove();
            });
        });
    }
  }
  changeColor(mat) {
    this.Mesh.children[0].material = mat;
  }
  ShowMoves() {
    this.CurrentAbility = "MoveAttack";
    this.CurrentAbility.Choose();
    this.Lobby.UpdateCurrentTilePosition();
  }
  ClickHandler() {
    this.CurrentAbility.SendData();
    this.Lobby.CurrentTile = null;
  }
}
