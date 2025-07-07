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
  },

  splitExpenses(amount, length){
    return amount / length
  },

  optimizeTransactions(balances) {
    const debtors = balances.filter(b => b.net < 0).map(b => ({ ...b }))
    const creditors = balances.filter(b => b.net > 0).map(b => ({ ...b }))

    const transactions = []

    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]

      const amount = Math.min(-debtor.net, creditor.net)

      transactions.push({
        fromId: debtor.id,
        from: debtor.name,
        toId: creditor.id,
        to: creditor.name,
        amount: Math.round(amount)
      })

      debtor.net += amount
      creditor.net -= amount

      if (Math.abs(debtor.net) < 0.01) i++
      if (Math.abs(creditor.net) < 0.01) j++
    }

    return transactions
  }
}