import { Model, DataTypes } from 'sequelize';

class WateringBaseline extends Model { }

function initWateringBaseline(sequelize) {
    WateringBaseline.init({
        refStructureName: DataTypes.TEXT,
        companyName: DataTypes.TEXT,
        fieldName: DataTypes.TEXT,
        sectorName: DataTypes.TEXT,
        irrigation_master_thesis: DataTypes.TEXT,
        date: DataTypes.DATEONLY,
        timestamp_from: DataTypes.DOUBLE,
        timestamp_to: DataTypes.DOUBLE,
        max_irrigation: DataTypes.DOUBLE,
        watering_capacity: DataTypes.DOUBLE,
        irrigation_baseline: DataTypes.DOUBLE,
        watering_hour: DataTypes.TIME
    }, {
        modelName: 'watering_baseline',
        timestamps: false,
        sequelize
    });

    return WateringBaseline;
}

export default initWateringBaseline;
