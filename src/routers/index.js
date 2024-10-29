const accountRouter = require("./accountUser.router");
const eventRouter = require("./event.router")
const sessionRouter = require("./session.router");

module.exports = (app) => {
    app.use("/accounts", accountRouter);
    app.use("/event", eventRouter);
    app.use("/session", sessionRouter)
}