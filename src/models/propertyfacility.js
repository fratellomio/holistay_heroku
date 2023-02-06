'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class propertyFacility extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  propertyFacility.init(
    {},
    {
      sequelize,
      modelName: 'propertyFacility',
      timestamps: false,
    }
  );
  return propertyFacility;
};
