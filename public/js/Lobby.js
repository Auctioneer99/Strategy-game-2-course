class Lobby {
  constructor(data) {
    this._name = data.name;
    this._tiles = [];
    this._markedTiles = [];
    this._units = new Map();
    this._currentTile = null;
    this._currentAbility = "MoveAttack";
    this._round;
    this._player = null;
    this._queue = [];
    this._pathPoints = [];
    this._actionQueue = new ActionQueue();
    this._raycaster = new THREE.Raycaster();
    this._roundItem = document.getElementById("round");
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setClearColor(0x111111);
    document.getElementById("screen").appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this._camera.position.set(40, 100, 123);

    this._controls = new THREE.OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._controls.mouseButtons = {
      LEFT: THREE.MOUSE.RIGHT,
      //MIDDLE: THREE.MOUSE.LEFT,
      RIGHT: THREE.MOUSE.MIDDLE,
    };
    this._controls.target = new THREE.Vector3(40, 0, 23);
    this._controls.minPolarAngle = Math.PI / 32;
    this._controls.maxPolarAngle = (Math.PI * 31) / 64;
    this._controls.enablePan = true;
    this._controls.minDistance = 50;
    this._controls.maxDistance = 600;
    this._plane = new THREE.Mesh(
      new THREE.PlaneGeometry(128, 128, 1, 1),
      COLOR_BLACK
    );
    this.Plane.rotateX(-Math.PI / 2);
    this.Plane.position.set(40, -2, 23);

    this._lights = {
      ambientLight: new THREE.AmbientLight(0x404040),
      light1: new THREE.DirectionalLight(0xffffff, 0.5),
      light2: new THREE.DirectionalLight(0xffffff, 0.5),
    };
    this._lights.light1.position.set(-1, 1, 1);
    this._lights.light2.position.set(-1, 1, -1);

    this._markedTile = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 1, 6, 1, false),
      COLOR_GREEN
    );
    this.MarkedTile.position.set(50, -20, 50);

    this._unitGeometry = objLoader.parse(unitObj);
    this._box = objLoader.parse(box).children[0];
    this._box.material = BOX_MATERIAL;
    this._box.scale.set(2.7, 1, 2.7);
    this._box.position.set(40, -2, 23);

    this._env = new THREE.Mesh(
      new THREE.SphereGeometry(1024, 128, 128),
      ENV_MATERIAL
    );
    this._env.position.set(40, 0, 23);

    this.Scene.add(this._env);
    this.Scene.add(this._box);
    this.Scene.add(this.Plane);
    this.Scene.add(this._lights.ambientLight);
    this.Scene.add(this._lights.light1);
    this.Scene.add(this._lights.light2);
    this.Scene.add(this.MarkedTile);

    data.tiles.forEach((t) => {
      this.Tiles.push(new Tile(t, this));
    });

    let k = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10 + (i % 2); j++) {
        let t = this.Tiles[k];
        t.Mesh.position.set(j * 9 + (i % 2) * -4.5, -1.4, i * 7.75);
        t.Point.position.set(j * 9 + (i % 2) * -4.5, -1.4, i * 7.75);
        k++;
      }
    }
    this.Tiles.forEach((t) => {
      for (let i = 0; i < 6; i++) {
        t.Connections[i] =
          t.Connections[i] == -1 ? null : this.Tiles[t.Connections[i]];
      }
    });
    (async (data) => {
      for (let i = 0; i < data.units.length; i++) {
        if (data.units.length == i + 1) {
          this.CreateUnit(data.units[i]).then(() => {
            this.Queue = data.queue;
          });
        } else {
          await this.CreateUnit(data.units[i]);
        }
      }
    })(data);
    this.Side = data.side;
    this.Player1 = data.player1;
    this.Player2 = data.player2;
    this.Round = data.round;
  }
  get Player1() {
    return this._player1;
  }
  get Player2() {
    return this._player2;
  }
  set Player1(value) {
    this._player1 = value;
    this.ShowPath(this.CurrentUnit);
    document.getElementById("player1").innerHTML =
      value.Name +
      (this.Side == "Yellow" ? " (You)" : "") +
      (value.Name != "Free slot" ? "<br>WR:" + value.winrate : "");
  }
  set Player2(value) {
    this._player2 = value;
    this.ShowPath(this.CurrentUnit);
    document.getElementById("player2").innerHTML =
      value.Name +
      (this.Side == "Red" ? " (You)" : "") +
      (value.Name != "Free slot" ? "<br>WR:" + value.winrate : "");
  }
  get Side() {
    return this._side;
  }
  set Side(value) {
    this._side = value;
    this.ShowPath(this.Queue[0]);
  }
  get MarkedTiles() {
    return this._markedTiles;
  }
  set MarkedTiles(value) {
    if (!value) {
      return;
    }
    this._markedTiles.forEach((t) => {
      t.SetUnavailable();
    });
    this._markedTiles = value;
    this._markedTiles.forEach((t) => {
      t.SetAvailable();
    });
    this.CurrentTile = null;
    if (value.length == 0) {
      this.PathPoints = [];
    }
  }
  get Raycaster() {
    return this._raycaster;
  }
  get PathPoints() {
    return this._pathPoints;
  }
  set PathPoints(value) {
    this.PathPoints.forEach((t) => {
      t.TogglePoint();
    });
    this._pathPoints = value;
    this.PathPoints.forEach((t) => {
      t.TogglePoint();
    });
  }
  get ActionQueue() {
    return this._actionQueue;
  }
  get UnitGeometry() {
    return this._unitGeometry;
  }
  get Controls() {
    return this._controls;
  }
  get Renderer() {
    return this._renderer;
  }
  get Camera() {
    return this._camera;
  }
  get Queue() {
    return this._queue;
  }
  set Queue(value) {
    if (this.CurrentUnit) {
      this.CurrentUnit.changeColor(materials[this.CurrentUnit.Race]);
    }
    /*
    let i = 0;
    for (; i < value.length; i++) {
      if (this._queue[i]) {
        if (this._queue[i], != value[i]) {
        }
      }
      else
      {
        this._queue.push()
      }
    }
    */
    console.log("removing");
    for (let i = 0; i < this.Queue.length; ) {
      let u = this.Queue[i];
      //console.log(u);
      if (value.indexOf(u.Id) == -1) {
        u.RemoveFromQueue();
        this.Queue.splice(i, 1);
        u.GenerateShape(u.Mesh.children[4], "-");
      } else {
        i++;
      }
    }
    console.log("adding");
    let k = 0;
    for (let i = 0; i < value.length; i++) {
      let u = this.Units[value[i]];
      //console.log(value[i]);
      //console.log(u);
      if (u) {
        if (this.Queue.indexOf(u) == -1) {
          this._queue.push(u);
          setTimeout(() => {
            u.AddToQueue();
          }, k * 100);
          k++;
        }
        u.GenerateShape(u.Mesh.children[4], i + 1);
      }
    }
    /*
    if (value.length > this._queue.length) {
      let k = 0;
      for (let i = 0; i < value.length; i++) {
        let u = this.Units[value[i]];
        if (this._queue.indexOf(u)) {
          this._queue.push(u);
          setTimeout(() => {
            u.AddToQueue();
          }, k * 100);
          k++;
        }
        u.GenerateShape(u.Mesh.children[4], i + 1);
      }
    } else {
      if (value.length < this._queue.length) {
        for (let i = 0; i < this._queue.length; i++) {
          let u = this._queue[i];
          if (value.indexOf(u.Id) == -1) {
            u.GenerateShape(u.Mesh.children[4], "-");
            u.RemoveFromQueue();
            this._queue.splice(i, 1);
            i--;
          } else {
            u.GenerateShape(u.Mesh.children[4], i + 1);
          }
        }
      }
    }*/
    if (this._queue.length > 0) {
      setTimeout(() => {
        this.CurrentUnit.ShowMoves();
        this.CurrentUnit.ShowSkills();
        this.CurrentUnit.changeColor(COLOR_CURRENTUNIT);
      }, 200);
    }
  }
  get MarkedTile() {
    return this._markedTile;
  }
  get Plane() {
    return this._plane;
  }
  get Scene() {
    return this._scene;
  }
  get Name() {
    return this._name;
  }
  get Tiles() {
    return this._tiles;
  }
  get Units() {
    return this._units;
  }
  get CurrentUnit() {
    return this.Queue[0];
  }
  get CurrentTile() {
    return this._currentTile;
  }
  set CurrentTile(value) {
    this._currentTile = value;
    if (value == null) {
      this.MarkedTile.position.set(50, -20, 50);
      this.MarkedTile.material.opacity = 0;
      this.PathPoints = [];
    } else {
      if (value.IsMarked) {
        this.MarkedTile.position.set(
          this.CurrentTile.Mesh.position.x,
          -1,
          this.CurrentTile.Mesh.position.z
        );
        this.MarkedTile.material.opacity = 0.2;
        if (this.CurrentUnit.CurrentAbility.Name == "MoveAttack") {
          this.ShowPath();
        } else {
          this.PathPoints = [this.CurrentTile];
        }
      } else {
        this.MarkedTile.position.set(50, -20, 50);
        this.MarkedTile.material.opacity = 0;
        this.PathPoints = [];
      }
    }
  }
  get Round() {
    return this._round;
  }
  set Round(value) {
    this._round = value;
    this._roundItem.innerHTML = "Раунд " + value;
  }
  RemoveUnit(unitID) {
    for (let key in this.Units) {
      if (this.Units[key].Id == unitID) {
        let u = this.Units[key];
        console.log(u.Name);
        u.Destroy();
        delete this.Units[key];
        break;
      }
    }
    for (let i = 0; i < this.Units.length; i++) {
      if (this.Units[i].Id == unitID) {
        let u = this.Units.splice(i, 1)[0];
        for (let i = 0; i < this.Queue.length; i++) {
          let t = this.Queue[i];
          if (t == u) {
            t.RemoveFromQueue();
            break;
          }
        }
        u.Destroy();
        break;
      }
    }
  }
  async CreateUnit(unitData) {
    for (let i = 0; i < unitData.abilities.length; i++) {
      let a = unitData.abilities[i];
      if (a.name == "CounterAttack") {
        continue;
      }
      if (!Abilities[a.name]) {
        await loadJS("js/Skills/" + a.name + ".js");
      }
    }
    let u = new Unit(unitData, this);
    this.Units[u.Id.toString()] = u;
    if (!materials[u.Name + u.Side]) {
      console.log("textures/" + u.Name + ".png");
      let m = new THREE.CanvasTexture(
        await loadAsset(bitmapLoader, "textures/" + u.Name + ".png")
      );
      m.anisotropy = 16;
      materials[u.Name + u.Side] = new THREE.MeshStandardMaterial({
        color: u.Side == "Red" ? "red" : "yellow",
        roughness: 0.65,
        metalness: 0.4,
        map: m,
      });
    }
    u.Mesh.children[1].material = materials[u.Name + u.Side];
    if (u.CurrentHealth <= 0) {
      u.Destroy();
    }
  }
  ShowPath() {
    if (this.CurrentTile != null) {
      let t = false;
      if (this.CurrentUnit.Ranged && this.CurrentTile.Unit != null) {
        for (let i = 0; i < 6; i++) {
          if (this.CurrentUnit.Tile.Connections[i] != null) {
            if (this.CurrentUnit.Tile.Connections[i].Unit != null) {
              break;
            }
          }
        }
        t = true;
      }
      this.PathPoints = t
        ? [this.CurrentTile]
        : this.CurrentUnit.Tile.BFS(this.CurrentTile);
    } else {
      this.PathPoints = [];
    }
  }
  UpdateCurrentTilePosition() {
    this.Raycaster.setFromCamera(mouse, this.Camera);
    let intersect = this.Raycaster.intersectObject(this.Plane);
    if (intersect[0]) {
      let p = intersect[0].point;
      let l = 10;
      let o = null;
      for (let i = 0; i < this.Tiles.length; i++) {
        let t = this.Tiles[i];
        let d = Math.sqrt(
          Math.pow(t.Mesh.position.x - p.x, 2) +
            Math.pow(t.Mesh.position.z - p.z, 2)
        );
        if (d < 5) {
          o = t;
          l = d;
          break;
        }
      }
      if (l < 5) {
        if (this.CurrentTile == o) {
          return;
        }
        if (!this.CurrentTile || (this.CurrentTile != o && o != null)) {
          this.CurrentTile = o;
        }
      } else {
        this.CurrentTile = null;
      }
    }
  }
  CreateMoves(unit) {
    //return this.CurrentAbility.Choose();
    //this.MarkedTiles = unit.CurrentAbility.Choose();
  }
}
