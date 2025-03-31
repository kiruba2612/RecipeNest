// dotenv config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const moverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");

process.env.PORT || 3001;

// router routes
const Authroute = require("./routes/authroutes");
const Reciperoute = require("./routes/reciperoute");

// DB Connection

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// session config

const sessionconfig = {
  secret: "shouldbesecret",
  resave: false,
  saveUninitialized: true, // Ensure uninitialized sessions are stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60, // Session expiration time in seconds (1 day)
    autoRemove: "native", // Auto-remove expired sessions
  }),
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

app.use(session(sessionconfig));

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Ensure session data is accessed correctly
  next();
});

// page config
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(moverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", Authroute);
app.use("/", Reciperoute);
// middlewere
app.use((req, res, next) => {
  res.locals.currentuser = req.session.user;
  next();
});

// routes

app.get("/", async (req, res) => {
  res.render("recipes/home");
});

//server running route

app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
