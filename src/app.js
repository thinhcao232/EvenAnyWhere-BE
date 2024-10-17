const express = require("express");
const app = express();
const connectDB = require("./configs/database");
const accountRoutes = require("./routers/index.js");
require("dotenv").config();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
accountRoutes(app);
app.use(cookieParser());
connectDB();

app.listen(3000, () => {
    console.log("Server run at port 3000");
})