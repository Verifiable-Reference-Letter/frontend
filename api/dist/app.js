"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const port = 8080; // default port to listen
const testApi_1 = require("./routes/testApi");
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bye", (req, res) => {
    const x = 10;
    res.send("Bye world!" + x);
});
app.use("/testAPI", testApi_1.router);
// start the Express server
app.listen(port, () => {
    console.log('server started at http://localhost:${ port }');
});
module.exports = app;
//# sourceMappingURL=app.js.map