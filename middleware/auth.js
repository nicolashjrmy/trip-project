const helper = require("../helper/authorization");
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const db = require("../models");
const Op = require("sequelize").Op;
const moment = require("moment");
module.exports = {
  async isLogin(req, res, next) {
    var bearerHeader = req.headers.authorization;
    //return res.send(bearerHeader)
    if (typeof bearerHeader === "undefined") {
      return res.status(401).send({ message: "unathorized" });
    }
    var token = helper.fromHeader(bearerHeader);

    jwt.verify(token, config.secret, async function (err, decoded) {
      if (!decoded) {
        return res.status(401).send({ message: "unathorized" });
      }
      // console.log(decoded)
      req.login = decoded;
      var user = await db.staff
        .findOne({
          where: {
            id: decoded.userId,
          },
          include: {
            model: db.role,
            include: {
              model: db.permission,
              where: {
                deletedAt: null,
              },
            },
          },
        })
        .catch((error) => {
          console.log(error);
        });

      if (!user) {
        return res.status(401).send({ message: "Unauthorized" });
      }

    //   if (user.deletedAt != null) {
    //     return res.status(401).send({ message: "Unauthorized" });
    //   }

    //   var permissions = [];
    //   user.roles.forEach((element) => {
    //     let temp = element.permissions.map(function (obj) {
    //       return obj.permission;
    //     });
    //     permissions.push(temp);
    //   });
    //   req.permissions = permissions.flat();
    //   next();
    });
  },
}