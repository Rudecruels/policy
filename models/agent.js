const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  agentName: String,
});

module.exports = mongoose.models.Agent || mongoose.model("Agent", AgentSchema);
