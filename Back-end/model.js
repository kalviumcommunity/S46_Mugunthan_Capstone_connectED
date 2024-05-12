const mongoose =require("mongoose")
const userSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    school:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    classs:{type:Number,required:true},
    type:{type:String,required:true},
    fullname:{type:String,required:true}
})

const User = mongoose.model("User",userSchema);

module.exports={User};