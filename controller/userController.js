
const db = require('../models')
const bcrypt = require('bcrypt')  
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const { Op } = require("sequelize");

module.exports = {
  async login(req,res){
    let {email, password} = req.body
    try{
      if(!email || !password){
        throw new Error("Email and password are required!")
      }
      email = email.toLowerCase()

      const login = await db.user.findOne({
        where:{
          email
        }
      })
      if(!login){
        throw new Error("Wrong email or password")
      }

      const checkPassword = await bcrypt.compare(password, login.password)
      if(!checkPassword){
        throw new Error("Wrong email or password")
      }

      const token = jwt.sign({
        id: login.id,
        email: login.email,
        username: login.username
      }, config.secret, {expiresIn: '30d'})

      return res.status(200).json({
        message: "Login success!",
        token: token
      })

    }catch(error){
      return res.status(401).json({message: error.stack})
    } 
  },

  async register(req,res){
    let {email, password, username, name} = req.body
    try{
      email = email.toLowerCase()
      const check = await db.user.findOne({
        where:{
          email, username
        },
      })

      if(check){
        throw new Error("Email or Username already registered")
      }

      const passwordHashed = await bcrypt.hash(password, 10)
      const user = await db.user.create({
        email,
        password: passwordHashed,
        username,
        name
      })

      return res.status(201).json({
        message: 'Registration success!',
        data: {
          email: user.email,
          username: user.username
        }
      })
    } catch(error){
      return res.status(400).json({message: error.stack})
    }
  },

  async changePassword(req,res){
    const {password, newPassword} = req.body
    const userId = req.login.id
    try{
      const user = await db.user.findOne({
        where: {
          id: userId
        }
      })

      const check = await bcrypt.compare(password, user.password)
      if(!check){
        throw new Error("Password's not match!")
      }

      const newPasswordHashed = await bcrypt.hash(newPassword, 10)
      await user.update({
        password: newPasswordHashed
      })

      return res.status(200).json({message: "Password changed successfully!"})

    }catch(error){
      return res.status(400).json({message: error.message})
    }
  }
}