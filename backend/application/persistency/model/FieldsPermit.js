const {Model, DataTypes} = require('sequelize')
const sequelize = require('../../configs/dbConfig')

class FieldsPermit extends Model {

}

function initFieldsPermit(sequelize) {
  FieldsPermit.init({
    permitid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    affiliation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refStructureName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sectorname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thesis: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permit: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'permit_fields',
    timestamps: false,
    sequelize
  });

  return FieldsPermit;
}

module.exports = initFieldsPermit;