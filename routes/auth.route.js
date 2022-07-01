const router = require("express").Router();
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { ensureLoggedOut, ensureLoggedIn } = require("connect-ensure-login");
const { registerValidator } = require("../utils/validators");

router.get(
  "/login",
  ensureLoggedOut({ redirectTo: "/" }),
  async (req, res, next) => {
    res.render("login");
  }
);

router.post(
  "/login",
  ensureLoggedOut({ redirectTo: "/" }),
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get(
  "/register",
  ensureLoggedOut({ redirectTo: "/" }),
  async (req, res, next) => {
    res.render("register");
  }
);

router.post(
  "/register",
  ensureLoggedOut({ redirectTo: "/" }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash("error", error.msg);
        });
        res.render("index", {
          messages: req.flash(),
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash("warning", "Username/email already exists");
        res.redirect("/auth/register");
        return;
      }
      const reqBody = req.body;
      if (email.includes("cs")) dept = "cse";
      else if (email.includes("ec")) dept = "ece";
      else if (email.includes("ee")) dept = "eee";
      else if (email.includes("me")) dept = "me";
      else if (email.includes("ce")) dept = "ce";
      else dept = "null";
      reqBody["department"] = dept;
      const user = new User(reqBody);
      await user.save();
      req.flash(
        "success",
        `${user.email} registered succesfully, you can now login`
      );
      res.redirect("/auth/login");
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/logout",
  ensureLoggedIn({ redirectTo: "/" }),
  async (req, res, next) => {
    req.logout();
    res.redirect("/");
  }
);

module.exports = router;
