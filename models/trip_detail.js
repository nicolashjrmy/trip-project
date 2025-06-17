'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class trip_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      trip_detail.hasMany(models.trip_detail_split, {foreignKey: "detailId", as: 'details'})
    }
  }
  trip_detail.init({
    tripId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    paidBy: DataTypes.INTEGER,
    participants: DataTypes.TEXT,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'trip_detail',
  });
  return trip_detail;
};