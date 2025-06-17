'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('trip_detail_splits', 'item',{ 
      type: Sequelize.STRING,
      after: "userId"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('trip_detail_splits', 'item');
  }
};
