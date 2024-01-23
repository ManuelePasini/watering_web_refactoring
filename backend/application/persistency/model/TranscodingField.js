const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class TranscodingField extends Model {

}

function initTranscodingField(sequelize) {

    TranscodingField.init({
        source: DataTypes.TEXT,
        refStructureId: DataTypes.TEXT,
        companyId: DataTypes.DOUBLE,
        fieldId: DataTypes.DOUBLE,
        plantId: DataTypes.DOUBLE,
        nodeId: DataTypes.TEXT,
        refStructureName: DataTypes.TEXT,
        companyName: DataTypes.TEXT,
        fieldName: DataTypes.TEXT,
        plantNum: DataTypes.DOUBLE,
        plantRow: DataTypes.TEXT,
        colture: DataTypes.TEXT,
        coltureType: DataTypes.TEXT,
        parcelCode: DataTypes.TEXT,
        address: DataTypes.TEXT,
        refNode: DataTypes.TEXT,
        doProfile: DataTypes.BOOLEAN,
        xxProfile: DataTypes.DOUBLE,
        yyProfile: DataTypes.DOUBLE,
        zzProfile: DataTypes.DOUBLE,
        sensorsNumber: DataTypes.INTEGER,
        plantName: DataTypes.TEXT,
        nodeDescription: DataTypes.TEXT,
        latitude: DataTypes.DOUBLE,
        longitude: DataTypes.DOUBLE,
    }, {
        modelName: 'transcoding_field',
        timestamps: false,
        sequelize
    });

    return TranscodingField;
}

module.exports = initTranscodingField;