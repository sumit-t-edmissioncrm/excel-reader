const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    gender: { type: String, required: true },
  },
  { timestamps: true }
);

const Leads = mongoose.model("Leads", leadSchema);

module.exports = Leads;
