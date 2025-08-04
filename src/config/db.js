import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: "hoteleo",
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
