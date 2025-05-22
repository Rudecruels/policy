const mongoose = require("mongoose");

const PolicyCarrierSchema = new mongoose.Schema({
  companyName: String,
});
const PolicyCarrier = mongoose.model("PolicyCarrier", PolicyCarrierSchema);

module.exports = PolicyCarrier;
