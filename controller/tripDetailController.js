const db = require('../models')

module.exports = {
  async createTripDetail(req,res){
    const {name,desc,amount,paidBy,participants} = req.body
    const userId = req.login.id
    const {id} = req.params.id
    try{
      const detail = await db.trip_detail.create({
        tripId: id,
        name,
        desc,
        amount,
        paidBy,
        participants,
        createdBy: userId
      })

      return res.status(200).send({message: 'success create trip detail', data: detail})     

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  }
}