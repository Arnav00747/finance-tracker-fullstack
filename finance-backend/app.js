const express = require("express");

const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// ✅ ROUTES YAHAN DAALO (BEFORE EXPORT)
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const recordRoutes = require("./routes/recordRoutes");
app.use("/api/records", recordRoutes);

app.get("/", (req, res) => {
  res.send("Server chal raha hai 🚀");
});

// ✅ EXPORT LAST ME
module.exports = app;