const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const {User}=require("./model")
const bodyParser = require("body-parser");
const app = express();
// app.use(express.json());

app.use(bodyParser.json());

router.get("/read",async(req,res)=>{
    try{
        const users =await User.find()
        res.json(users);
    }catch(err){
        res.status(500).json({message:err.message})
    }
})
router.post("/auser", async (req, res) => {
    try {
        // Log the request body to see its contents
        console.log("Request Body:", req.body);

        // Retrieve data from request body 
        if (!req.body) {
            return res.status(400).json({ message: "Missing request body" });
          }
          const {username,section,password,classs,fullname} = req.body

        // Create a new user instance
        const savedUser = await User.create({
            username,
            section,
            password,
            classs,
            fullname,
        });
        
        res.status(201).json(savedUser);
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ message: err.message });
    }
});
router.delete("/delete/:id",async(req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if (user == null) {
            return res.status(404).json({ message: "User not found" });
          }
          res.json({ message: "Item deleted successfully" });
        } catch (err) {
          return res.status(500).json({ message: err.message });
        }
    })

router.put("/post/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const updatedPost = await Data.findByIdAndUpdate(id, { title, content }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(200).json({ message: "Post updated successfully.", updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Error updating post." });
  }
});

module.exports=router;
