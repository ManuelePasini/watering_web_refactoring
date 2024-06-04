const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class WateringField extends Model {

}

function initWateringField(sequelize) {

    WateringField.init({
        refStructureName: DataTypes.TEXT,
        companyName: DataTypes.TEXT,
        fieldName: DataTypes.TEXT,
        sectorName: DataTypes.TEXT,
        plantRow: DataTypes.TEXT,
        timestamp_from: DataTypes.DOUBLE,
        timestamp_to: DataTypes.DOUBLE,
        prescriptive: DataTypes.BOOLEAN,
        dripper_pos: DataTypes.INTEGER
    }, {
        modelName: 'watering_fields',
        timestamps: false,
        sequelize
    });

    return WateringField;
}

module.exports = initWateringField;