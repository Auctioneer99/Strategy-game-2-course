class Player {
  constructor(req) {
    if (req) {
      this._user = req.user ? req.user : { login: "Guest" };
      this._cook = req.cookies["connect.sid"];
      console.log("Not Free slot");
    } else {
      console.log("Free slot");
      this._user = { login: "Free slot" };
      this._cook = null;
    }
  }
  get Auth() {
    return this._user != null;
  }
  get User() {
    return this._user;
  }
  get Cookie() {
    return this._cook;
  }
  get Name() {
    return this.User.login;
  }
}

module.exports = Player;
