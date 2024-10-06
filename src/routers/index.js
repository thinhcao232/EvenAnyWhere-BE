const accountRouter = require("./accountUser.router");

module.exports = (app) => {
    app.use("/api/accounts", accountRouter);
}