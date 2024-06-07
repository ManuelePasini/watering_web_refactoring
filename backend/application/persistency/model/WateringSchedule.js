const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class WateringSchedule extends Model { }

function initWateringSchedule(sequelize) {
    WateringSchedule.init({
        refStructureName: DataTypes.TEXT,
        companyName: DataTypes.TEXT,
        fieldname: DataTypes.TEXT,
        sectorName: DataTypes.TEXT,
        plantRow: DataTypes.TEXT,
        date: DataTypes.DATEONLY,
        watering_start: DataTypes.DOUBLE,
        watering_end: DataTypes.DOUBLE,
        duration: DataTypes.DOUBLE,
        enabled: DataTypes.BOOLEAN,
        expected_water: DataTypes.DOUBLE,
        advice: DataTypes.DOUBLE,
        advice_timestamp: DataTypes.DOUBLE,
        userId: DataTypes.INTEGER,
        update_timestamp: DataTypes.DOUBLE,
        note: DataTypes.TEXT,
    }, {
        modelName: 'watering_schedule',
        timestamps: false,
        sequelize
    });

    return WateringSchedule;
}

module.exports = initWateringSchedule;
