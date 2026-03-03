const express = require("express");
const router = express.Router();
const csrf = require("host-csrf");

router.get("/", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }

  csrf.getToken(req, res);
  console.log("CSRF Token:", res.locals._csrf);
  res.render("secretWord", { secretWord: req.session.secretWord, csrfToken: res.locals._csrf });
});

router.post("/", csrf.csrf(), (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("errors", "That word won't work!");
    req.flash("errors", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }

  res.redirect("/secretWord");
});

module.exports = router;