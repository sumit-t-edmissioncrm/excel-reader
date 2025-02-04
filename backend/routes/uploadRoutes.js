const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const Student = require("../models/Leads");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        console.log("CSV Parsed Data:", results);

        await Student.insertMany(results);
        fs.unlinkSync(filePath);
        res.json({ success: true, message: "Data saved to MongoDB!" });
      } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Database Insert Error:", error);
        // res.json({ success: false, message: error.message });
        res.json({
          success: false,
          message: "Error: Proper formantt is required in CSV file!",
        });
      }
    })
    .on("error", (err) => {
      console.error("CSV Parsing Error:", err);
      res.status(500).json({ success: false, message: "CSV parsing failed" });
    });
});

module.exports = router;
