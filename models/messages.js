const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  message: String,
  scheduledTime: Date,
  status: { type: String, default: "pending" },
});

module.exports =
  mongoose.models.Messages || mongoose.model("Messages", MessageSchema);
