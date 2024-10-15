const express = require("express");
const app = express();
const connectDB = require("./configs/database");
const accountRoutes = require("./routers/index.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
accountRoutes(app);

connectDB();

<<<<<<< HEAD
app.listen(3000, () => {
    console.log("Server run at port 3000");
=======
app.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

app.listen(5000, () => {
    console.log("Server run at port 5000");
>>>>>>> tuan
})