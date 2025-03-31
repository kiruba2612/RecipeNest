const express = require("express");
const router = express.Router();
const Recipe = require("../models/recipe");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// Authentication middlewere
const isAuth = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

// new recipe Route
router.get("/new", isAuth, (req, res) => {
  res.render("recipes/new");
});

router.post("/new", upload.array("image"), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const data = req.body;
    const images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));

    const recipe = new Recipe({
      ...data,
      image: images,
      userId: req.session.user.id, // Add userId from session
    });

    await recipe.save();
    res.redirect(`/show/${recipe.id}`);
  } catch (error) {
    console.error("Error posting recipe:", error);
    res.redirect("/recipe/new");
  }
});

// Index route
router.get("/recipe", isAuth, async (req, res) => {
  const recipes = await Recipe.find({});
  res.render("recipes/index", { recipes });
});

// show route
router.get("/show/:id", async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  res.render("recipes/show", { recipe, user: req.session.user });
});

// edit route
router.get("/edit/:id", isAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  res.render("recipes/edit", { recipe });
});

// update route
router.put("/recipe/:id", isAuth, async (req, res) => {
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
router.delete("/recipe/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  await Recipe.findByIdAndDelete(id);
  res.redirect("/recipe");
});

// meal route
router.get("/meal", isAuth, (req, res) => {
  res.render("recipes/meal");
});

module.exports = router;
