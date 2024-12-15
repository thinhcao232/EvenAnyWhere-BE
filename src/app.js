const express = require("express");
const session = require('express-session');
const http = require("http");
const path = require("path");
const { initSocket } = require("./configs/socket.js");
const app = express();
const connectDB = require("./configs/database.js");
const Routes = require("./routers/index.js");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const server = http.createServer(app)
const passport = require('passport');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'superkey123!@#',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
Routes(app);

connectDB();

initSocket(server);
// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})