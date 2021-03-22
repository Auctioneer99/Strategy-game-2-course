module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },
  isAdmin: function(req) {
    if (req.user) return req.user.email == "121212";
    else return false;
  },
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.email == "121212") return next();
    }
    return res.redirect("/");
  }
};
