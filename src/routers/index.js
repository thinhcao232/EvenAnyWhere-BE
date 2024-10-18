const accountRouter = require("./accountUser.router");
const eventRouter = require("./event.router")


module.exports = (app) => {
    app.use("/accounts", accountRouter);
    app.use("/event",eventRouter)
}