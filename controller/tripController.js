const db = require('../models')
const bcrypt = require('bcrypt')  
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const { Op, or } = require("sequelize");
const utils = require("../helper/utils");

module.exports = {
  async createTrip(req,res){
    const {title, destination, desc} = req.body
    const userId = req.login.id
    try{
      if(!title || !destination){
        throw new Error("Title and destination are required!")
      }

      let participant = []
      participant.push(userId)

      const trip = await db.trip.create({
        title,
        participant: JSON.stringify(participant),
        destination,
        desc,
        createdBy: userId
      })

      return res.status(201).send({ message: "Trip created successfully!", data: trip})
    }catch(error){
      return res.status(400).json({message: error.message})
    }     
  },

  async getAllTrip(req,res){
    let pagination= utils.pagination(req.query)
    const userId = req.login.id
    try{
      const trips = await db.trip.findAll({
        where: {
          [Op.or]:[
            {createdBy: userId},
            {participant: {[Op.like]: `%${userId}%`}}
          ]
        },
        limit: pagination.limit,
        offset: pagination.offset,
        order: [[pagination.orderBy, pagination.dir]],
      })

      return res.status(200).send({message: "success", data: trips})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async editTrip(req,res){
    const {id} = req.params
    const {title, destination, desc} = req.body 
    try{
      const trip = await db.trip.findOne({
        where: {
          id
        }
      })

      if(!trip){
        throw new Error("Trip not found!")
      }

      await trip.update({
        title: title || trip.title,
        destination: destination || trip.destination,
        desc: desc || trip.desc,
      })

      return res.status(200).send({ message: "Trip updated successfully!", data: trip})
    }catch(error){
      return res.status(400).json({message: error.message})
    }     
  }

  // async createDetailTrip(req, res) {

  // }
}