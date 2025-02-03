const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("MongoDB Connected!"));

const getDynamicModel = (modelName, fields) => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  const schemaObj = {};
  fields.forEach((field) => {
    schemaObj[field] = { type: String };
  });
  const schema = new mongoose.Schema(schemaObj, { timestamps: true });
  return mongoose.model(modelName, schema);
};

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const results = [];
  let headers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("headers", (headerList) => {
      headers = headerList;
    })
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const DynamicModel = getDynamicModel("LeadUploadedData", headers);
        await DynamicModel.insertMany(results);
        fs.unlinkSync(filePath); // Delete file after processing
        res.json({ success: true, message: "Data saved to MongoDB!" });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
