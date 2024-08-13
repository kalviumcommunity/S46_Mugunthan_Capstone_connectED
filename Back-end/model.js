const { required } = require("joi");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  school: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  classs: { type: Number, required: true },
  type: { type: String, required: true },
  fullname: { type: String, required: true },
});

const dataSchema = new mongoose.Schema({
  user: { type: String },
  message: { type: String },
  imglink: { type: String },
  school: { type: String },
  classs: { type: Number },
});
const User = mongoose.model("User", userSchema);
const Data = mongoose.model("Data", dataSchema);
module.exports = { User, Data };
