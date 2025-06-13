const helper = require("../helper/authorization");
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const db = require("../models");
const Op = require("sequelize").Op;
const moment = require("moment");
module.exports = {
    async isLogin(req, res, next) {
        var bearerHeader = req.headers.authorization;
        if (typeof bearerHeader === "undefined") {
            return res.status(401).send({ message: "unauthorized" });
        }
        var token = helper.fromHeader(bearerHeader);

        jwt.verify(token, config.secret, async function (err, decoded) {
        if (err || !decoded) {
            return res.status(401).send({ message: "unauthorized" });
        }
        var user = await db.user.findOne({
            where: { id: decoded.id },
        }).catch((error) => {
            console.log(error);
        });

        if (!user) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        req.login = decoded;
        next();
    });
    }
}