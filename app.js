const express = require("express");
require("express-async-errors");
require("dotenv").config();

// Security
// const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");

// Database
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

// Authentication
const passport = require("passport");
const passportInit = require("./passport/passportInit");

// Routes
const secretWordRouter = require("./routes/secretWord");
const jobsRouter = require("./routes/jobs");
const auth = require("./middleware/auth");

// Middleware
const storeLocals = require("./middleware/storeLocals");

const app = express();

// View engine
app.set("view engine", "ejs");

// Body parser
app.use(express.urlencoded({ extended: true }));

// Session store setup
const store = new MongoDBStore({
  uri: mongoURL,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

// Session configuration
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

// Security middleware
// app.use(helmet());
// app.use(xss());
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Middleware setup (order matters!)
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session(sessionParms));

// Authentication middleware
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(require("connect-flash")());

// Custom middleware for template locals
app.use(storeLocals);
app.get("/", (req, res) => {
  const csrfToken = csrf.getToken(req, res);
  res.render("index", {
    user: req.user,
    csrfToken: csrfToken,
  });
});
app.use("/sessions", require("./routes/sessionRoutes"));


// secret word handling
app.use("/secretWord", auth, secretWordRouter);

// jobs handling
app.use("/jobs", auth, jobsRouter);

// Error handling
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  if (err && err.name === "CSRFError") {
    return res.status(403).send("CSRF token mismatch");
  }
  console.log(err);
  return res.status(500).send(err.message);
});

// Server startup
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
