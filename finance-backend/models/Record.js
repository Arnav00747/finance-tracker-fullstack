const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },

  category: {
    type: String,
    required: true,
    lowercase: true   // 🔥 auto lowercase (best practice)
  },

  date: {
    type: Date,
    default: Date.now   // 🔥 auto date if not given
  },

  note: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);