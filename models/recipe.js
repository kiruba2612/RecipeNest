const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  ingredients: { type: String, required: true },
  steps: { type: String, required: true },
  image: [{ url: String, filename: String }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Stores the user who posted
});

module.exports = mongoose.model("Recipe", recipeSchema);
