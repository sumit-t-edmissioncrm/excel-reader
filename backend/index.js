const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("MongoDB Connected!"));

app.use("/api", uploadRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
