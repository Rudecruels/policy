const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  policyNumber: String,
  policyStartDate: String,
  policyEndDate: String,
  policyCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Lob" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "PolicyCarrier" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
});

const Policy = mongoose.model("Policy", PolicySchema);

module.exports = Policy;
