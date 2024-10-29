const accountRouter = require("./accountUser.router");
const eventRouter = require("./event.router")
const sessionRouter = require("./session.router");
const eventParticipants = require("./eventParticipation.router")

module.exports = (app) => {
    app.use("/accounts", accountRouter);
    app.use("/event", eventRouter);
    app.use("/session", sessionRouter);
    app.use("/participation", eventParticipants)
}