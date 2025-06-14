const moment = require("moment");
const db = require("../models");
const Op = require("sequelize").Op;

module.exports = {
  pagination(pagination) {
    var perPage =
      pagination.perPage && !isNaN(parseInt(pagination.perPage))
        ? parseInt(pagination.perPage)
        : 10;
    var currentPage =
      pagination.currentPage && !isNaN(parseInt(pagination.currentPage))
        ? parseInt(pagination.currentPage)
        : 1;
    var orderBy = pagination.orderBy ? pagination.orderBy : "id";
    var dir = pagination.dir ? pagination.dir : "desc";
    var limit = 0;
    var offset = 0;
    if (pagination.perPage == "all") {
      limit = null;
      offset = 0;
    } else {
      limit = perPage ? +perPage : 10;
      offset = currentPage ? currentPage * limit - perPage : 0;
    }

    return { limit, offset, orderBy, dir };
  },

  async getFollowersCount(id) {
    let count = await db.connect.count({
      where: {
        followingId: id,
      },
    });
    if(!count){
        count = 0
    }
    return count
  },

  async getFollowingCount(id){
    let count =  await db.connect.count({
        where: {
            followersId: id,
        }
    })
    if(!count){
        count = 0
    }
    return count
  }


}