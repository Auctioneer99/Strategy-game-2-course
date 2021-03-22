const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

router.post("/register", (req, res) => {
  const { login, email, password1, password2 } = req.body;
  console.log(req.body);
  let errors = [];

  if (!login || !email || !password1 || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password1 != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password1.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }
  console.log(errors);
  if (errors.length > 0) {
    res.render("register", {
      errors,
      login,
      email,
      password1,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          login,
          email,
          password1,
          password2,
        });
      } else {
        const newUser = new User({
          login: login,
          email: email,
          password: password1,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

module.exports = router;
