import express from "express";
import cors from "cors";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

// Routes
app.use("/", roomRoutes);

app.get("/", (req, res) => {
  res.send("Hoteleo Server is Cooking (MVC + Mongoose)!");
});

export default app;
