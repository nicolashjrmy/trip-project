const { format } = require('morgan')
const utils = require('../helper/utils')
const db = require('../models')

module.exports = {
  async createTripDetail(req, res) {
    const { name, desc, amount, paidBy, participants, splitType = 'equal', customSplits, additionalFees } = req.body
    
    let safeCustomSplits = []
    let safeAdditionalFees = []
    
    try {
      safeCustomSplits = typeof customSplits === 'string' ? JSON.parse(customSplits) 
      : (Array.isArray(customSplits) ? customSplits : [])
    } catch (e) {
      safeCustomSplits = []
    }
    
    try {
      safeAdditionalFees = typeof additionalFees === 'string' ? JSON.parse(additionalFees) 
      : (Array.isArray(additionalFees) ? additionalFees : [])
    } catch (e) {
      safeAdditionalFees = []
    }
    const userId = req.login.id
    const { id } = req.params
    const t = await db.sequelize.transaction()
    
    try {
      const check = await db.trip.findOne({
        where: { id }
      })
      if (!check) {
        throw new Error('trip not found')
      }

      const detail = await db.trip_detail.create({
        tripId: id,
        name,
        desc,
        amount,
        paidBy,
        participants,
        createdBy: userId,
      }, { transaction: t })
      
      const participantIds = JSON.parse(participants || '[]');
      let splitAmounts = {}

      if (splitType === 'equal') {
        const amountOwed = utils.splitExpenses(amount, participantIds.length)
        participantIds.forEach(participantId => {
          splitAmounts[participantId] = amountOwed
        })
      } else if (splitType === 'custom') {
        participantIds.forEach(participantId => {
          splitAmounts[participantId] = 0
        })

        if (safeAdditionalFees.length > 0) {
          const additionalFeeTotal = safeAdditionalFees.reduce((sum, fee) => sum + fee.amount, 0)
          const additionalFeePerPerson = additionalFeeTotal / participantIds.length
      
          participantIds.forEach(participantId => {
            splitAmounts[participantId] += additionalFeePerPerson
          })
        }

        safeCustomSplits.forEach(split => {
          if (participantIds.includes(split.userId)) {
            splitAmounts[split.userId] += split.amount
          }
        })

        const totalSplitAmount = Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0)
        if (Math.abs(totalSplitAmount - amount) > 0.01) {
          throw new Error(`Split amounts don't match total. Expected: ${amount}, Got: ${totalSplitAmount}`)
        }
      }

      for (const participantId of participantIds) {
        let paid = participantId == paidBy

        let itemName = name
        if (splitType === 'custom') {
          const customSplit = safeCustomSplits.find(split => split.userId === participantId)
          itemName = customSplit.name
        }
        
        await db.trip_detail_split.create({
          detailId: detail.id,
          userId: participantId,
          owed: splitAmounts[participantId] || 0,
          isPaid: paid,
          item: itemName
        }, { transaction: t })
      }

      await t.commit()
      return res.status(200).send({ message: 'success create trip detail', data: detail })

    } catch (error) {
      await t.rollback()
      return res.status(400).json({ message: error.message })
    }
  },

  async getTripDetail(req,res){
    const {id} = req.params
    try{
      const detail = await db.trip_detail.findAll({
        where: {tripId: id},
        include: [{
          model: db.user,
          attributes: ['name']
        }],
        raw: true
      })

      const formattedResponse = detail.map(item => {
        const participants = JSON.parse(item.participants) || []
        return{
          ...item,
          paidBy: item["user.name"],
          countParticipant: participants.length,
          ['user.name']: undefined
        }
      })

      return res.status(200).send({message: 'success get detail trip', data: formattedResponse})

    }catch(error){
      return res.status(400).json({message: error.stack})
    }
  },
}