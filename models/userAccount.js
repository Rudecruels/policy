const mongoose = require("mongoose");

const UserAccountSchema = new mongoose.Schema({
  accountName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
});

const UserAccount = mongoose.model("UserAccount", UserAccountSchema);

module.exports = UserAccount;
