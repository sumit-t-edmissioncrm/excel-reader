const fs = require("fs").promises;
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log("Uploads folder ensured.");
  } catch (err) {
    console.error("Error creating uploads folder:", err);
  }
})();

const multer = require("multer");
const upload = multer({ dest: uploadDir });

module.exports = upload;
