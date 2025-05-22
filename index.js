const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const policyRouter = require("./routes/policy.router");

const app = express();
app.use(express.json());
app.use("/api/policy", policyRouter);

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("DB connection successful!"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
