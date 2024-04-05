const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config()
const app = express();
const port = 9001;

const startDatabase = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

startDatabase();

const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

const checkDatabaseConnection = (req, res, next) => {
  if (!isConnected()) {
    return res.status(500).json({ message: "Database is not connected" });
  }
  next(); // Call next to move to the next middleware or route handler
};

app.use(checkDatabaseConnection); // Apply the middleware globally

app.get("/", (req, res) => {  
  res.json({ message: 'Initiated backed' });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
