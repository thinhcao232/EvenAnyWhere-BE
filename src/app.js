const express = require("express");
const http = require("http");
const path = require("path");
const { initSocket } = require("./configs/socket.js");
const app = express();
const connectDB = require("./configs/database.js");
const Routes = require("./routers/index.js");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const server = http.createServer(app)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

Routes(app);

connectDB();

initSocket(server);
// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})