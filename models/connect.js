'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class connect extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      connect.belongsTo(models.user, {foreignKey: 'followersId', as: 'followers' })
      connect.belongsTo(models.user, {foreignKey: 'followingId', as: 'following' })
    }
  }
  connect.init({
    followersId: DataTypes.INTEGER,
    followingId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'connect',
  });
  return connect;
};