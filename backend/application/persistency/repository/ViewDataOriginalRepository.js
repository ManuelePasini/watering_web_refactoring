const DataViewOriginalWrapper = require('../nativeQueryWrapper/ViewDataOriginalWrapper');

const {QueryTypes} = require('sequelize');

const getResults = async (calculationType, detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType, sequelize) => {

    const query = `
            SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            "detectedValueTypeDescription",
                            "plantNum",
                            "plantRow",
                            "colture",
                            "coltureType",
                            ${calculationType} as value,
                            "timestamp"
            FROM view_data_original
            WHERE "detectedValueTypeId" = ANY ('{ ${detectedValueTypeDescription.map(value => `${value}`).join(', ')} }')
              AND "timestamp" >= '${timeFilterFrom}'
              AND "timestamp" <= '${timeFilterTo}'
              AND "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND ("fieldName" IS NULL
               OR "fieldName" = '${fieldName}')
              AND "plantNum" = '${plantNum}'
              AND "plantRow" = '${plantRow}'
              AND "colture" = '${colture}'
              AND "coltureType" = '${coltureType}'
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "plantNum", "plantRow", "colture", "coltureType", "timestamp"
            ORDER BY timestamp ASC`;

    const results = await sequelize.query(query,
        {
            type: QueryTypes.SELECT,
            bind: {
                detectedValueTypeDescription,
                timeFilterFrom,
                timeFilterTo,
                refStructureName,
                companyName,
                fieldName,
                plantNum,
                plantRow,
                colture,
                coltureType,
                calculationType
            }
        }
    );

    return results.map(result => new DataViewOriginalWrapper(
        result.refStructureName,
        result.companyName,
        result.fieldName,
        result.plantNum,
        result.plantRow,
        result.colture,
        result.coltureType,
        result.detectedValueTypeDescription,
        result.value,
        result.timestamp,
    ));
}

class ViewDataOriginalRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType) {
        return getResults('AVG(\"value\")', detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType, this.sequelize);
    }

    async findEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType) {
        return getResults('AVG(64.3 * \"value\" -15.2)', 'ELECT_COND', timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType, this.sequelize);
    }

    async findHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType) {
        return getResults('SUM(\"value\")', detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType, this.sequelize);
    }
}

module.exports = ViewDataOriginalRepository;

