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
          ],
          isArchive: false
        },
        limit: pagination.limit,
        offset: pagination.offset,
        order: [[pagination.orderBy, pagination.dir]],
      })

      if (trips.length === 0) {
        return res.status(200).send({ message: "success", data: [] })
      }

      const allUserIds = new Set()
      trips.forEach(trip => {
        allUserIds.add(trip.createdBy)
        if (trip.participant) {
          try {
            const participantIds = JSON.parse(trip.participant)
            if (Array.isArray(participantIds)) {
              participantIds.forEach(id => allUserIds.add(id))
            }
          } catch (error) {
              console.error('Error parsing participants for trip', trip.id, error)
          }
        }
      })

      const users = await db.user.findAll({
        where: {
          id: {
            [Op.in]: Array.from(allUserIds)
          }
        },
          attributes: ['id', 'username'] 
      })

      const userMap = new Map()
      users.forEach(user => {
        userMap.set(user.id, user.username)
      })

      const tripsWithParticipants = trips.map(trip => {
        const tripData = trip.toJSON()
        let participantNames = []

        if (trip.participant) {
          try {
            const participantIds = JSON.parse(trip.participant)
            if (Array.isArray(participantIds)) {
              participantNames = participantIds
              .map(id => userMap.get(id))
              .filter(username => username) 
            }
          } catch (error) {
            console.error('Error parsing participants for trip', trip.id, error)
          }
        }
            
        return {
          ...tripData,
          participant: participantNames,
          createdBy: userMap.get(trip.createdBy) || 'Unknown'
        }
      })

      return res.status(200).send({ message: "success", data: tripsWithParticipants })      

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getById(req,res){
    const id = req.params.id
    try{
      const trips = await db.trip.findByPk(id)

      if(!trips){
        throw new Error('No Trips Found!')
      }

      return res.status(200).send({message: "success", data: trips})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },  

  async getAllTripParticipant(req,res){
    const id = req.params.id
    try{
      const trip = await db.trip.findOne({
        where:{
          id
        },
        attributes: ['participant']
      })

      if(!trip){
        throw new Error('trip not found!')
      }

      const participantIds = JSON.parse(trip.participant || '[]');

      const list = await db.user.findAll({
        where: {id: participantIds},
        attributes: ['id', 'username', 'name']
      })

      return res.status(200).send({
        message: 'success get all trip participant',
        data: list
      })

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
  },

  async deleteTrip(req,res){
    const id = req.params.id
    try{
      await db.trip.destroy({
        where: {id}
      })

      return res.status(200).send({message: 'success delete trip'})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async addTripParticipants(req,res){
    const id = req.params.id
    const {userId} = req.body
    try{
      if(!Array.isArray(userId) || userId.length === 0){
        throw new Error('userId must be an array')
      }

      const trip = await db.trip.findOne({
        where: {id}
      })
      if(!trip){
        throw new Error('trip not found!')
      }
      
      const users = await db.user.findAll({
        where: { id: userIdArray },
        attributes: ['id'],
      });

      const foundUserIds = users.map((u) => u.id);
      const notFound = userIdArray.filter((id) => !foundUserIds.includes(id));
      if (notFound.length > 0) {
        throw new Error(`The following user(s) do not exist: ${notFound.join(', ')}`);
      }

      const currentParticipants = JSON.parse(trip.participant || '[]');
      const alreadyParticipants = userIdArray.filter((id) =>
        currentParticipants.includes(id)
      );
    if (alreadyParticipants.length > 0) {
      throw new Error(`User(s) already in participants: ${alreadyParticipants.join(', ')}`);
    }

    const updatedParticipants = [...currentParticipants, ...userIdArray];
    await trip.update({ participant: JSON.stringify(updatedParticipants) });

    return res.status(200).json({
      message: 'Participants added successfully!',
      participants: updatedParticipants,
    });
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async joinTripByInvite(req, res) {
    const { token } = req.params;
    const userId = req.login.id;
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const [tripId] = decoded.split(':');

      const trip = await db.trip.findOne({ 
        where: { id: tripId } 
      });
      if (!trip) throw new Error('Trip not found!');

      let participants = JSON.parse(trip.participant || '[]');
      if (participants.includes(userId)) {
        return res.status(400).json({ message: 'You are already a participant!' });
      }
      participants.push(userId);

      await trip.update({ participant: JSON.stringify(participants) });
      return res.status(200).json({ message: 'You have joined the trip!', participants });
    }catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async generateInviteLink(req, res) {
    const { id } = req.params;
    try {
      const token = Buffer.from(`${id}:${Date.now()}`).toString('base64');
      const link = `${req.protocol}://${req.get('host')}/trips/join/${token}`;
      return res.status(200).json({ message: 'Invite link generated!', link });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async archiveTrip(req,res){
    const {id} = req.params
    try{
      const trip = await db.trip.findOne({
        where: {id}
      })
      if(!trip){
        throw new Error('trip not found!')
      }

      const isEmpty = await db.trip_detail.findAll({where: {tripId: id}})
      if(isEmpty.length === 0){
        throw new Error('cannot archive empty trips')
      }

      await trip.update({
        isArchive: true
      })

      return res.status(200).send({message: 'success archive trips', data: trip})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getReport(req,res){
    const {id} = req.params
    try{
      const report = await db.trip_detail.findAll({
        where: {tripId: id},
        include: [
          {
            model: db.trip_detail_split,
            as: 'details',
            include:[
              {
                model: db.user,
                as: 'user',
                attributes: ['name']
              }
            ]
          }
        ],
      })

      return res.status(200).send({message: 'success get report', data: report})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  }
}