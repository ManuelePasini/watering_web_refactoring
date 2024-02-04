const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class TranscodingField extends Model {

}

function initTranscodingField(sequelize) {

    TranscodingField.init({
        source: DataTypes.TEXT,
        refStructureName: DataTypes.TEXT,
        companyName: DataTypes.TEXT,
        fieldName: DataTypes.TEXT,
        coltureType: DataTypes.TEXT,
        sectorname: DataTypes.TEXT,
        wateringcapacity: DataTypes.DOUBLE,
        initialwatering: DataTypes.DOUBLE,
        maximumwatering: DataTypes.DOUBLE,
        advicetime: DataTypes.DOUBLE,
        wateringtype: DataTypes.TEXT,
        adviceweight: DataTypes.DOUBLE,
        thesisname: DataTypes.TEXT,
        sensorNumber: DataTypes.TEXT,
        sensorid: DataTypes.TEXT,
        sensorname: DataTypes.TEXT,
        sensortype: DataTypes.TEXT,
        x: DataTypes.DOUBLE,
        y: DataTypes.DOUBLE,
        z: DataTypes.DOUBLE
    }, {
        modelName: 'transcoding_fields',
        timestamps: false,
        sequelize
    });

    return TranscodingField;
}

module.exports = initTranscodingField;