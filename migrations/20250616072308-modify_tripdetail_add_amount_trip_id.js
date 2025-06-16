'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('trip_details', 'tripId',{ 
      type: Sequelize.INTEGER,
      after: "id"
    });
    await queryInterface.addColumn('trip_details', 'amount',{ 
      type: Sequelize.INTEGER,
      after: "desc"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('trip_details', 'tripId');
    await queryInterface.removeColumn('trip_details', 'amount');
  }
};
