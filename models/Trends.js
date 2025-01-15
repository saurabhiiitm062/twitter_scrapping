const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
  runId: { type: String, required: true },
  trends: { type: [String], required: true },
  ipAddress: { type: String, required: true },
  proxyIPAddress: { type: String, required: true }, // Ensure this field is here
  datetime: { type: Date, required: true },
});

const Trend = mongoose.model("Trend", trendSchema);

module.exports = Trend;
