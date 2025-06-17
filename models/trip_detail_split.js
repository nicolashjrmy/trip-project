'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class trip_detail_split extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  trip_detail_split.init({
    detailId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    owed: DataTypes.INTEGER,
    isPaid: DataTypes.BOOLEAN,
    item: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'trip_detail_split',
  });
  return trip_detail_split;
};