const express = require("express");
const passport = require("passport");
const router = express.Router();
const csrf = require("host-csrf");
const csrfMiddleware = csrf.csrf();

const {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} = require("../controllers/sessionController");

router.route("/register").get(registerShow).post(registerDo);

router
  .route("/logon")
  .get(logonShow)
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    })
  );

router.route("/logoff").post(csrfMiddleware, logoff);

module.exports = router;