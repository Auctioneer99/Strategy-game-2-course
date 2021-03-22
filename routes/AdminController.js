const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, isAdmin } = require("../lib/auth");

router.get("/admin", ensureAdmin, (req, res) =>
  res.render("admin", {
    servers: () => {
      let arr = [];
      //games.forEach((v) => arr.push(v.sessionToSend(null)));
      return arr;
    },
  })
);

module.exports = router;
