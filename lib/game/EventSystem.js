class EventSystem {
  constructor() {
    this._callbacks = [];
  }
  AddEventListener(eventName, handler, handlerName) {
    if (eventName in this._callbacks) {
      if (handlerName) {
        this._callbacks[eventName][handlerName] = handler;
      } else {
        this._callbacks[eventName].push(handler);
      }
    } else {
      if (handlerName) {
        this._callbacks[eventName] = [];
        this._callbacks[eventName][handlerName] = handler;
      } else {
        this._callbacks[eventName] = [handler];
      }
    }
  }
  RemoveEventListener(eventName, handlerName) {
    for (let key in this._callbacks) {
      if (key == eventName) {
        for (let n in this._callbacks[key]) {
          if (n == handlerName) {
            delete this._callbacks[key][n];
          }
        }
      }
    }
  }
  DispatchEvent(eventName, target) {
    if (this._callbacks[eventName]) {
      for (let handler in this._callbacks[eventName]) {
        this._callbacks[eventName][handler](target);
      }
    }
  }
}

module.exports = EventSystem;
