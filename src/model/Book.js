const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  cover: { type: String, required: true },
  price: { type: String, required: true },
  url: { type: String, required: true },
  userID: { type: String, required: true },
  tag: { type: String },
});

export default module = mongoose.model("Book", bookSchema);
