const accountRouter = require("./accountUser.router");
const eventRouter = require("./event.router")
const sessionRouter = require("./session.router");
const eventParticipants = require("./eventParticipation.router")
const livestreamInfo = require("./livestreamInfo.router")
const admin = require("./admin.router")
const category = require("./categoryEvent.router")
module.exports = (app) => {
    app.use("/accounts", accountRouter);
    app.use("/event", eventRouter);
    app.use("/session", sessionRouter);
    app.use("/participation", eventParticipants)
    app.use("/livestreamInfo", livestreamInfo)
    app.use("/admin", admin)
    app.use("/category", category)
}