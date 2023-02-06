'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class facility extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      facility.belongsToMany(models.property, {
        through: 'propertyFacility',
      });
    }
  }
  facility.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'facility',
    }
  );
  return facility;
};
