
const db = require('../models')
const bcrypt = require('bcrypt')  
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const { Op } = require("sequelize");
const utils = require("../helper/utils");

module.exports = {
  async changePassword(req,res){
    const {password, repeatPassword, newPassword} = req.body
    const userId = req.login.id
    try{
      const user = await db.user.findOne({
        where: {
          id: userId
        }
      })

      const checkRepeatPassword = password === repeatPassword
      if(!checkRepeatPassword){
        throw new Error("Password doesn't match!")
      }

      const check = await bcrypt.compare(password, user.password)
      if(!check){
        throw new Error("Current password's incorrect!")
      }

      const newPasswordHashed = await bcrypt.hash(newPassword, 10)
      await user.update({
        password: newPasswordHashed
      })

      return res.status(200).json({message: "password changed successfully!"})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async editProfile(req,res){
    const {username, email, name} = req.body
    const userId = req.login.id
    try{
      const user = await db.user.findOne({
        where:{
          id: userId
        }
      })

      await user.update({
        username: username,
        email: email,
        name: name
      })

      return res.status(200).send({message: 'success edit profile', data: user})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getProfile(req,res){
    const userId = req.login.id
    try{
      const user = await db.user.findOne({
        where: {
          id: userId
        },
        attributes: {
          exclude: ['password', 'updatedAt'], 
        }
      })

      const followers = await utils.getFollowersCount(userId)
      const following = await utils.getFollowingCount(userId)

      const data = {
        followers,
        following,
        ...user.dataValues
      }

      return res.status(200).send({message: 'success', data:data})

    }catch(error){
      return res.status(400).json({message: error.stack})  
    }
  },

  async getProfileById(req,res){
    const {id} = req.params
    const userId = req.login.id
    try{
      const user = await db.user.findOne({
        where: {
          id: id
        },
        attributes: {
          exclude: ['password', 'updatedAt', 'email', 'id'], 
        }
      })

      const followers = await utils.getFollowersCount(id)
      const following = await utils.getFollowingCount(id)
      let isFollowing = true

      const checkFollowing = await db.connect.findOne({
        where:{
          followingId: id,
          followersId: userId
        }
      })
      if(!checkFollowing){
        isFollowing = false
      }

      const data = {
        followers,
        following,
        isFollowing,
        ...user.dataValues
      }

      return res.status(200).send({message: 'success', data:data})

    }catch(error){
      return res.status(400).json({message: error.stack})  
    }
  },

  async followUser(req,res){
    const userId = req.login.id
    const {id} = req.params
    try{
      if(userId === id){
        throw new Error("You cannot follow yourself!")
      }
      
      const user = await db.user.findOne({
        where: {
          id
        }
      })
      if(!user){
        throw new Error("User not found!")
      }

      const checkFollow = await db.connect.findOne({
        where:{
          followersId: userId,
          followingId: id
        }
      })
      if(checkFollow){
        throw new Error("You already follow this user!")
      }

      await db.connect.create({
        followersId: userId,
        followingId: id
      })

      return res.status(200).json({message: "success following user"})
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async unfollowUser(req,res){
    const userId = req.login.id
    const {id} = req.params
    try{ 
      const user = await db.user.findOne({
        where: {
          id
        }
      })
      if(!user){
        throw new Error("User not found!")
      }

      const checkFollow = await db.connect.findOne({
        where:{
          followersId: userId,
          followingId: id
        }
      })
      if(!checkFollow){
        throw new Error("You haven't follow this user!")
      }

      await db.connect.destroy({
        where: {
          followersId: userId,
          followingId: id
        }
      })
      return res.status(200).json({message: "success unfollowing user"})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getFollowersDetail(req,res){
    const {id} = req.params
    try{
      const followers = await db.connect.findAll({
        where: {followingId: id},
        include: [
        {
          model: db.user,
          as: 'followers',
          attributes: ['id', 'username', 'name']
        }
        ],
        attributes: {
          exclude: ['followersId', 'followingId', 'id'], 
        }
      })

      const followersList = followers.map(f => f.followers);

      return res.status(200).send({message: 'success', data: followersList})
 
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getFollowingDetail(req,res){
    const {id} = req.params
    try{
      const following = await db.connect.findAll({
        where: {followersId: id},
        include: [
        {
          model: db.user,
          as: 'following',
          attributes: ['id', 'username', 'name']
        }
        ],
        attributes: {
          exclude: ['followersId', 'followingId', 'id'], 
        }
      })

      const followingList = following.map(f => f.following);
      return res.status(200).send({message: 'success', data: followingList})
 
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },
  async getOwnFollowers(req,res){
    const id = req.login.id
    try{
      const followers = await db.connect.findAll({
        where: {followingId: id},
        include: [
        {
          model: db.user,
          as: 'followers',
          attributes: ['id', 'username', 'name']
        }
        ],
        attributes: {
          exclude: ['followersId', 'followingId', 'id'], 
        }
      })

      const followersList = followers.map(f => f.followers);

      return res.status(200).send({message: 'success', data: followersList})
 
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async getOwnFollowing(req,res){
    const id = req.login.id
    try{
      const following = await db.connect.findAll({
        where: {followersId: id},
        include: [
        {
          model: db.user,
          as: 'following',
          attributes: ['id', 'username', 'name']
        }
        ],
        attributes: {
          exclude: ['followersId', 'followingId', 'id'], 
        }
      })

      const followingList = following.map(f => f.following);
      return res.status(200).send({message: 'success', data: followingList})
 
    }catch(error){
      return res.status(400).json({message: error.message})
    }
  }      
}