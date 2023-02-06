"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasOne(models.tenant);
      user.hasMany(models.transaction);
      user.hasMany(models.login);
    }
  }
  user.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          not: /^[0-9+=()!@#$%^&*_`~<>?{}]*$/,
          //nama tidak mengandung angka dan karakter spesial tertentu
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/i,
          //minimal 8 karakter, harus mengandung huruf(kapital atau kecil), harus mengandung angka
          len: [8],
        },
      },
      address: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
      },
      birthdate: {
        type: DataTypes.DATEONLY,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      photo: {
        type: DataTypes.STRING,
        defaultValue: 'default_profile_picture.jpg',
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
      },
      isTenant: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};
