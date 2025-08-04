import admin from "../config/firebaseAdmin.js";

// 🔹 Verify Token Email
export const verifyTokenEmail = (req, res, next) => {
  if (req.query.email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};
