const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors middleware
const { fetchCollectionNames } = require("./collections");
const router = require("./route");
require("dotenv").config();

const app = express();
const port = 9001;

app.use(express.json());


app.use(cors());

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

// Route for fetching collection names
app.get('/collections', fetchCollectionNames);

// API routes
app.use("/", router);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
