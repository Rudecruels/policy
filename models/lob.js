const mongoose = require("mongoose");

const LOBSchema = new mongoose.Schema({
  categoryName: String,
});

const Lob = mongoose.model("Lob", LOBSchema);

module.exports = Lob;
