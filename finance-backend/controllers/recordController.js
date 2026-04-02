const Record = require("../models/Record");


// ================= ADD RECORD =================
exports.addRecord = async (req, res) => {
  try {
    const { amount, category, note, type } = req.body;

    if (!amount || !category || !type) {
      return res.status(400).json({ msg: "All fields required ❌" });
    }

    const record = new Record({
      user: req.user.id,
      amount,
      category: category.toLowerCase(),
      note,
      type,
      date: new Date() // optional but good
    });

    await record.save();

    res.json({ msg: "Record added ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error ❌" });
  }
};


// ================= GET RECORDS =================
exports.getRecords = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;

    let filter = { user: req.user.id };

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Record.find(filter).sort({ createdAt: -1 });

    res.json(records);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};


// ================= DELETE =================
exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!record) {
      return res.status(404).json({ msg: "Record not found ❌" });
    }

    res.json({ msg: "Deleted ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error ❌" });
  }
};


// ================= UPDATE =================
exports.updateRecord = async (req, res) => {
  try {
    const { amount, category, note, type } = req.body;

    const updated = await Record.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        amount,
        category: category.toLowerCase(),
        note,
        type
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Record not found ❌" });
    }

    res.json({ msg: "Updated ✅", updated });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error ❌" });
  }
};


// ================= SUMMARY API (UPGRADED) 🔥 =================
exports.getSummary = async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id });

    let income = 0;
    let expense = 0;
    let categoryWise = {};

    records.forEach(r => {
      const amt = Number(r.amount);

      if (r.type === "income") {
        income += amt;
      } else {
        expense += amt;
      }

      if (!categoryWise[r.category]) {
        categoryWise[r.category] = 0;
      }

      categoryWise[r.category] += amt;
    });

    const balance = income - expense;

    res.json({
      income,
      expense,
      balance,
      categoryWise
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error ❌" });
  }
};