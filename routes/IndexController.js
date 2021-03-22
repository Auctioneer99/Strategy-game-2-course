const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, isAdmin } = require("../lib/auth");

module.exports = function (LManager) {
  router.use((req, res, next) => {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.log(fullUrl);
    next();
  });
  router.use("/game", function (req, res, next) {
    if (req.query.id) {
      res.cookie("game", req.query.id, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
    } else {
      if (!req.cookies.game) {
        return res.redirect(
          "/game?id=" + (LManager.Lobbys[0] ? LManager.Lobbys[0].Name : "null")
        );
      } else {
        return res.redirect("/game?id=" + req.cookies.game);
      }
    }
    next();
  });

  router.get("/game", (req, res) =>
    res.render("index", { auth: req.isAuthenticated(), admin: isAdmin(req) })
  );
  router.get("/join", (req, res) => {
    if (req.query.id) {
      let g = LManager.LobbyByName(req.query.id);
      if (g) {
        if (g.PlayerJoin(req, res)) {
          res.status(200).end();
          return "ok";
        }
      }
    }
    req.respo;
    res.send("failed");
  });
  router.get("/", (req, res) => res.redirect("/game"));

  router.use((req, res) => {
    res.header(404);
    res.render("404");
  });
  router.use((err, req, res, next) => {
    console.log(err);
    res.header(404);
    res.send("404");
  });
  return router;
};
