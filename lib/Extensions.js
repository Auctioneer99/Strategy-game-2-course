Object.defineProperty(console, "logObj", {
  value: function logObj(obj) {
    if (!obj) {
      throw "No object given";
    }
    return console.log(obj.toString());
  },
  writable: false,
  enumerable: false,
  configurable: false,
});

class Linq {
  constructor(arr) {
    this._arr = arr;
  }
  Where(lambda) {
    let t = [];
    this._arr.forEach((e) => {
      if (lambda(e)) {
        t.push(e);
      }
    });
    this._arr = t;
    return this;
  }
  Select(lambda) {
    let t = [];
    this._arr.forEach((e) => {
      t.push(lambda(e));
    });
    this._arr = t;
    return this;
  }
  ToArray() {
    return this._arr;
  }
  First() {
    return this._arr[0];
  }
  Last() {
    return this._arr[this._arr.length - 1];
  }
  Print() {}
}

module.exports = Linq;

/*
class Enumerator {
  _i;
  _arr;
  constructor(arr) {
    this._i = -1;
    this._arr = arr;
  }
  Reset() {
    this._i = -1;
  }
  MoveNext() {
    return ++this._i < this._arr.length;
  }
  get Current() {
    return this._i < 0 || this._i >= this._arr.length
      ? null
      : this._arr[this._i];
  }
}
*/
