const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  steps: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Recipe", recipeSchema);
