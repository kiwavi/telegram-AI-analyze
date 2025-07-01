"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var express_1 = require("express");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT;
var node_postgres_1 = require("drizzle-orm/node-postgres");
exports.db = (0, node_postgres_1.drizzle)(process.env.DATABASE_URL);
app.get("/", function (req, res) {
    res.send("");
});
app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
});
