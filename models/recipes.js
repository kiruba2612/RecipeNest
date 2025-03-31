const mongoose = require("mongoose");
const Recipe = require("../models/recipe");
const data = require("../data.json");

mongoose.connect("mongodb://localhost:27017/recipe");
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const dataconnect = async () => {
  await Recipe.deleteMany({}); // Delete existing recipes

  for (let i = 0; i < data.dish.length; i++) {
    // Corrected loop condition
    const recipe = new Recipe({
      name: data.dish[i].name, // Directly assigning values
      cuisine: data.dish[i].cuisine,
      ingredients: data.dish[i].ingredients,
      steps: data.dish[i].steps,
      image: data.dish[i].image,
    });
    await recipe.save();
  }

  console.log("All recipes added!");
};

dataconnect().then(() => {
  mongoose.connection.close(); // Close connection after operation
});
