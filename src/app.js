const express = require("express");
const app = express();
const connectDB = require("./configs/database");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.listen(5000, () => {
    console.log("Server run at port 5000");
})