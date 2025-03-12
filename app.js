const express = require("express");
const app = express();
const port = 3001;
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Recipe = require("./models/recipe");
const User = require("./models/user");
const moverride = require("method-override");
const Query = require("./models/community");
const session = require("express-session");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
// DB Connection

mongoose.connect("mongodb://localhost:27017/recipe");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// middlewere
// app.use((req, res, next) => {
//   res.locals.currentUser = req.user; // Ensure session data is accessed correctly
//   next();
// });

// session config

const sessionconfig = {
  secret: "shouldbesecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/recipe",
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

app.use(session(sessionconfig));

// page config
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(moverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// app.engine("ejs", ejsMate);

// middlewere
app.use((req, res, next) => {
  res.locals.currentuser = req.session.user;
  next();
});

const isAuth = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

// routes

app.get("/", async (req, res) => {
  res.render("recipes/home");
});

// logout route

app.get("/logout", (req, res) => {
  res.render("users/login");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/"); // Redirect somewhere safe if there's an error
    }
    res.clearCookie("connect.sid"); // Clears the session cookie
    res.redirect("/login"); // Redirect after session is destroyed
  });
});

// login route
app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findOne({ name });
  if (!user) {
    return res.redirect("/register");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.redirect("/login");
  }
  req.session.isAuth = true;
  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
  };
  res.redirect("/");
});

// register route
app.get("/register", (req, res) => {
  res.render("users/register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    // console.log("existing user")
    return res.redirect("/register");
  }
  const hashpsw = await bcrypt.hash(password, 12);
  const newuser = new User({ name, email, password: hashpsw });
  await newuser.save();
  res.redirect("/login");
});

// new recipe Route
app.get("/new", isAuth, (req, res) => {
  res.render("recipes/new");
});

app.post("/new", async (req, res) => {
  const data = req.body;
  const recipe = new Recipe(data);
  await recipe.save();
  res.render("recipes/show", { recipe });
});
// Index route
app.get("/recipe", async (req, res) => {
  const recipes = await Recipe.find({});
  // console.log(recipes);
  res.render("recipes/index", { recipes });
});

// show route
app.get("/show/:id", isAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  res.render("recipes/show", { recipe });
});

// edit route
app.get("/edit/:id", isAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  res.render("recipes/edit", { recipe });
  // res.redirect("recipes/show", { recipe });
});
// update route
app.put("/recipe/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  await Recipe.findByIdAndUpdate(
    id,
    {
      ...req.body.recipe,
    },
    { new: true }
  );
  res.redirect(`/show/${id}`);
});

// Delete route
app.delete("/recipe/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  await Recipe.findByIdAndDelete(id);
  res.redirect("/recipe");
});

// meal route
app.get("/meal", isAuth, (req, res) => {
  res.render("recipes/meal");
});
// community route
app.get("/community", isAuth, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.render("recipes/community", { queries });
  } catch (err) {
    console.error("Error fetching queries:", err);
    res.status(500).send("Error fetching queries");
  }
});

// POST: Add a New Query
app.post("/add-query", async (req, res) => {
  const { name, query, content } = req.body;
  try {
    const newQuery = new Query({ name, query, content, replies: [] });
    await newQuery.save();
    res.redirect("/community");
  } catch (err) {
    console.error("Error saving query:", err);
    res.status(500).send("Error saving query");
  }
});

// POST: Add a Reply
app.post("/add-reply/:id", async (req, res) => {
  const { replierName, reply } = req.body; // Get replier’s name and reply text
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).send("Query not found");
    }

    query.replies.push({ name: replierName, text: reply }); // Store reply with name
    await query.save();
    res.redirect("/community");
  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(500).send("Error adding reply");
  }
});

//server running route
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
