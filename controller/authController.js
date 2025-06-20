const db = require('../models')
const bcrypt = require('bcrypt')  
const jwt = require("jsonwebtoken");
const config = require("../configjwt");
const { Op } = require("sequelize");
const utils = require("../helper/utils");

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
      }, config.secret, {expiresIn: '15m'})

      const refresh_token = jwt.sign({
        id: login.id,
        email: login.email,
        username: login.username
      }, config.refreshSecret, {expiresIn: '7d'})

      await db.refresh_token.create({
        userId: login.id,
        token: refresh_token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })

      return res.status(200).json({
        message: "Login success!",
        token,
        refresh_token
      })

    }catch(error){
      return res.status(401).json({message: error.message})
    } 
  },

  async register(req,res){
    let {email, password, username, name} = req.body
    try{
      email = email.toLowerCase()
      const check = await db.user.findOne({
        where:{
          [Op.or]: [
            {email}, 
            {username}
          ]
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
        message: 'registration success',
        data: {
          email: user.email,
          username: user.username
        }
      })
    } catch(error){
      return res.status(400).json({message: error.message})
    }
  },

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
  
    try {
      if (!refreshToken) {
        throw new Error("Refresh token required");
      }

      const decoded = jwt.verify(refreshToken, config.refreshSecret);
    
      const storedToken = await db.refresh_token.findOne({
        where: { 
          token: refreshToken,
          userId: decoded.id,
          expiresAt: { [Op.gt]: new Date() }
        }
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    const user = await db.user.findByPk(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    const newAccessToken = jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username
    }, config.secret, { expiresIn: '15m' });

    return res.status(200).json({
      new_token: newAccessToken
    });

  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}
    
}