'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('trips', 'isComplete',{ 
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      before: "isArchive"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('trips', 'isComplete');
  }
};
