const mongoose = require("mongoose");

const UniversityHierarchySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    parent: { type: String, required: true },
  },
  { timestamps: true }
);

const Hierarchy = mongoose.model("Hierarchy", UniversityHierarchySchema);

module.exports = Hierarchy;
