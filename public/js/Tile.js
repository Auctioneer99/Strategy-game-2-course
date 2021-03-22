class Tile {
  constructor(tileData, lobby) {
    this._id = tileData.id;
    this._connections = tileData.connections;
    this._unit = tileData.unit;
    this._lobby = lobby;
    this._mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 1, 6, 1, false),
      COLOR_GREY
      /*new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 1,
      })*/
    );
    this._point = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 8),
      new THREE.MeshBasicMaterial({
        color: 0xbb0033,
        transparent: true,
        opacity: 0,
      })
    );
    this.Lobby.Scene.add(this.Mesh);
    this.Lobby.Scene.add(this.Point);
  }
  get IsMarked() {
    return this._mesh.material == COLOR_DARKGREY;
  }
  get Lobby() {
    return this._lobby;
  }
  get Id() {
    return this._id;
  }
  get Connections() {
    return this._connections;
  }
  get Unit() {
    return this._unit;
  }
  set Unit(value) {
    if (typeof value == "number") {
      value = this.Lobby.Units[value];
    }
    this._unit = value;
  }
  get Mesh() {
    return this._mesh;
  }
  get Point() {
    return this._point;
  }
  getDist(n) {
    let queue1 = [this.id];
    let queue2 = [];
    let result = [this.id];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < queue1.length; j++) {
        let t = tileByID(queue1[j]);
        for (let k = 0; k < 6; k++) {
          if (t.connections[k] != -1)
            if (
              result.indexOf(t.connections[k]) == -1 &&
              queue2.indexOf(t.connections[k]) == -1
            )
              if (tileByID(t.connections[k]).unitID == null)
                queue2.push(t.connections[k]);
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) {
        if (result.indexOf(queue2[j]) == -1) result.push(queue2[j]);
        queue1.push(queue2[j]);
      }
      queue2 = [];
    }
    return result;
  } //Выбрать точки для передвижения;
  GetAbsDist(n) {
    let queue1 = [this];
    let queue2 = [];
    let temp = [];
    let result = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < queue1.length; j++) {
        let t = queue1[j];
        for (let k = 0; k < 6; k++) {
          if (t.Connections[k] != null) {
            if (temp.indexOf(t.Connections[k]) == -1) {
              let u = t.Connections[k].Unit;
              if (!u) {
                result.push(t.Connections[k]);
              }
            }
            queue2.push(t.Connections[k]);
            temp.push(t.Connections[k]);
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) {
        queue1.push(queue2[j]);
      }
      queue2 = [];
    }
    return result;
  } //Выбрать точки с юнитами независомо от препятствий;
  GetAbsDistUnits(n, side) {
    let queue1 = [this];
    let queue2 = [];
    let temp = [];
    let result = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < queue1.length; j++) {
        let t = queue1[j];
        for (let k = 0; k < 6; k++) {
          if (t.Connections[k] != null) {
            if (temp.indexOf(t.Connections[k]) == -1) {
              let u = t.Connections[k].Unit;
              if (u && u.Side == side) {
                result.push(t.Connections[k]);
              }
            }
            queue2.push(t.Connections[k]);
            temp.push(t.Connections[k]);
          }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) {
        queue1.push(queue2[j]);
      }
      queue2 = [];
    }
    return result;
  } //Выбрать точки с юнитами независомо от препятствий;
  getMeleeDist(n, side) {
    let queue1 = [this.id];
    let queue2 = [];
    let temp = [];
    let result = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < queue1.length; j++) {
        let t = tileByID(queue1[j]);
        for (let k = 0; k < 6; k++) {
          if (t.connections[k] != -1)
            if (temp.indexOf(t.connections[k]) == -1) {
              let u = unitByID(tileByID(t.connections[k]).unitID);
              if (u) {
                if (u.stats.side != side) result.push(t.connections[k]);
              } else queue2.push(t.connections[k]);
              temp.push(t.connections[k]);
            }
        }
      }
      queue1 = [];
      for (let j = 0; j < queue2.length; j++) queue1.push(queue2[j]);
      queue2 = [];
    }
    return result;
  } //Выбрать точки с юнитами зависимо от препятствий;
  Mark(material) {
    this.Mesh.material = material;
  } //Изменение цвета тайла;
  TogglePoint() {
    this.Point.material.opacity == 0
      ? (this.Point.material.opacity = 1)
      : (this.Point.material.opacity = 0);
  } //Изменение прозрачности внутренних точек;
  SetAvailable() {
    this.Mark(COLOR_DARKGREY);
  } //Изменение цвета для активности;
  SetUnavailable() {
    this.Mark(COLOR_GREY);
  } //Изменение цвет для бездействия;
  CreateRange() {
    let queue1 = [this];
    let queue2 = [];
    let result = [this];
    for (let i = 0; i < this.Unit.CurrentMoves; i++) {
      queue1.forEach((t) => {
        if (t.Unit == null || t.Unit == this.Unit) {
          t.Connections.forEach((n) => {
            if (n != null) {
              if (result.indexOf(n) == -1 && queue2.indexOf(n) == -1) {
                if (n.Unit == null || n.Unit.Side != this.Unit.Side) {
                  queue2.push(n);
                }
              }
            }
          });
        }
      });
      queue1 = [];
      queue2.forEach((t) => {
        if (result.indexOf(t) == -1) {
          result.push(t);
        }
        queue1.push(t);
      });
      queue2 = [];
    }
    return result;
  }
  createTargetsForRanged(distance, side) {
    for (let i = 0; i < this.connections.length; i++)
      if (this.connections[i] != -1) {
        let u = unitByID(tileByID(this.connections[i]).unitID);
        if (u) if (u.stats.side != side) return [];
      }
    return this.getAbsDist(distance, side);
  } //Доступные тайлы для дальней атаки;
  BFS(end) {
    let i = 1;
    let num = [];
    let start = this;
    num.length = this.Lobby.Tiles.length;
    num.fill(0, 0, this.Lobby.Tiles.length);
    let Root = new Tree(start, null);
    let Queue = [Root];
    let path = [];
    num[start.Id] = i;
    i++;
    while (Queue.length > 0) {
      let parentNode = Queue.shift();
      for (let k = 0; k < 6; k++) {
        let neighbor = parentNode.Value.Connections[k];
        if (
          neighbor != null &&
          num[neighbor.Id] == 0 &&
          (neighbor.Unit == null ||
            this.Lobby.CurrentTile.Unit == neighbor.Unit)
        ) {
          let child = new Tree(neighbor, parentNode);
          if (neighbor == end) {
            while (child.Parent) {
              path.push(child.Value);
              child = child.Parent;
            }
            return path;
          }
          Queue.push(child);
          num[neighbor.Id] = i;
          i++;
        }
      }
    }
    return path;
  }
  ZoneControl() {
    for (let i = 0; i < 6; i++)
      if (this.Connections[i] != null) {
        let u = this.Connections[i].Unit;
        if (u != null) {
          if (u.Side != this.Unit.Side) {
            return true;
          }
        }
      }
    return false;
  }
}

class Tree {
  constructor(value, parent) {
    this._value = value;
    this._parent = parent;
    this._child = [];
    if (parent != null) {
      this._parent.Child.push(this);
    }
  }
  get Value() {
    return this._value;
  }
  get Parent() {
    return this._parent;
  }
  get Child() {
    return this._child;
  }
}
