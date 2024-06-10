import { ViewDataOriginalWrapper } from '../querywrappers/ViewDataOriginalWrapper.js';

import { QueryTypes } from 'sequelize';

const getResults = async (calculationType, detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType, sequelize) => {

    const query = `
            SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            "detectedValueTypeDescription",
                            "sectorName",
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
              AND "fieldName" = '${fieldName}'
              AND "sectorName" = '${sectorName}'
              AND "plantRow" = '${plantRow}'
              AND "colture" = '${colture}'
              AND "coltureType" = '${coltureType}'
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorName", "plantRow", "colture", "coltureType", "timestamp"
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
                sectorName,
                plantRow,
                colture,
                coltureType,
                calculationType
            }
        }
    );

    return results.map(result => new ViewDataOriginalWrapper(
        result.refStructureName,
        result.companyName,
        result.fieldName,
        result.sectorName,
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

    async findAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        return getResults('AVG(\"value\")', detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType, this.sequelize);
    }

    async findEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        return getResults('AVG(64.3 * \"value\" -15.2)', ['ELECT_COND'], timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType, this.sequelize);
    }

    async findHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        return getResults('SUM(\"value\")', detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType, this.sequelize);
    }
}

export default ViewDataOriginalRepository;

