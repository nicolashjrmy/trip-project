'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasMany(models.connect, {foreignKey: "followersId"})
      user.hasMany(models.connect, {foreignKey: "followingId"})
      user.hasMany(models.trip_detail_split, { foreignKey: 'userId'});
      user.hasMany(models.trip_detail, { foreignKey: 'paidBy'});
    }
  }
  user.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};