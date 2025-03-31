const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// login route
router.get("/login", (req, res) => {
  res.render("users/login", {
    error: req.query.error,
    success: req.query.success,
  });
});

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });

    if (!user) {
      return res.redirect("/login?error=User not found. Please register.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect("/login?error=Incorrect password. Try again.");
    }

    req.session.isAuth = true;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.redirect("/login?success=Login successful! Redirecting...");
  } catch (error) {
    console.error("Login Error:", error);
    res.redirect("/login?error=Something went wrong. Try again.");
  }
});

// register route
router.get("/register", (req, res) => {
  res.render("users/register", {
    error: req.query.error,
    success: req.query.success,
  });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect(
        "/register?error=Email already exists. Try logging in."
      );
    }

    const hashpsw = await bcrypt.hash(password, 12);
    const newuser = new User({ name, email, password: hashpsw });
    await newuser.save();

    res.redirect(
      "/register?success=Registration successful! Redirecting to login..."
    );
  } catch (error) {
    console.error("Registration Error:", error);
    res.redirect("/register?error=Something went wrong. Try again.");
  }
});
// Logout Route - GET (Optional: Just Redirect to Login)
router.get("/logout", (req, res) => {
  res.redirect("/login"); // Redirect users to the login page
});

// Logout Route - POST (Proper Logout with Session Clearing)
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/"); // Redirect somewhere safe if there's an error
    }
    res.clearCookie("connect.sid"); // Clears the session cookie
    res.redirect("/login"); // Redirect after session is destroyed
  });
});

module.exports = router;
