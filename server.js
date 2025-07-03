const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"));

app.use("/api/auth", authRoutes);

// Optional: expose base URL
app.get("/", (req, res) => {
  res.send(`Backend is running at ${process.env.BASE_URL}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `Server running at ${process.env.BASE_URL || `http://localhost:${PORT}`}`
  )
);
