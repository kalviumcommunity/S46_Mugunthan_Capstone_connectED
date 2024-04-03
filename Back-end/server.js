const express = require("express");
const app = express();
const port =9000;

app.get("/", (req, res) => {  
    res.json({message: 'Initiated backend'});
    // res.json({ hello: "hello" });
  });

app.listen(port,()=>{
  console.log(`server is running on port ${port}`)
})