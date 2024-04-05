const mongoose =require("mongoose")
const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    class:{type:Number,required:true,min:1,max:12},
    section:{type:String,required:true},
    password:{type:String,required:true}
})

const User = mongoose.model("User",userSchema);

module.exports={User};