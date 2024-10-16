const express = require("express");
const app = express();
const connectDB = require("./configs/database");
const accountRoutes = require("./routers/index.js");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
accountRoutes(app);

connectDB();

app.listen(3000, () => {
    console.log("Server run at port 3000");
})