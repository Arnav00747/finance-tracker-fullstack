const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // 👈 id + role

    next();

  } catch {
    res.status(401).json({ msg: "Unauthorized ❌" });
  }
};