const express = require("express");
const router = express.Router();
const csrf = require("host-csrf");
const csrfMiddleware = csrf.csrf();

router.get("/", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }

  const csrfToken = csrf.getToken(req, res);
  res.render("secretWord", { secretWord: req.session.secretWord, csrfToken: csrfToken });
});

router.post("/", csrfMiddleware, (req, res) => {
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