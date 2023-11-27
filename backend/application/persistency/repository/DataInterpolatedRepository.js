const DataViewOriginalWrapper = require('../nativeQueryWrapper/ViewDataOriginalWrapper');

const {QueryTypes} = require('sequelize');

const getResults = async (refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo, sequelize) => {

    const query = `
            SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            "plantNum",
                            "plantRow",
                            "zz",
                            "yy",
                            "xx",
                            "timestamp",
                            "value"
            FROM data_interpolated
            WHERE "refStructureName" = ${refStructureName}
              AND "companyName" = ${companyName}
              AND ("fieldName" = '' OR "fieldName" = ${fieldName})
              AND "plantNum" = ${plantNum}
              AND "plantRow" = ${plantRow}
              AND "timestamp" >= ${timestampFrom}
              AND "timestamp" <= ${timestampTo}
              AND ("zz" = 0 OR "zz" IS NULL)
            ORDER BY "refStructureName", "companyName", "fieldName", "plantNum", "plantRow", "timestamp", "zz", "yy","xx"`;

    const results = await sequelize.query(query,
        {
            type: QueryTypes.SELECT,
            bind: {
                refStructureName,
                companyName,
                fieldName,
                plantNum,
                plantRow,
                timestampFrom,
                timestampTo
            }
        }
    );

    return results.map(result => new DataInterpolatedRepository(
        result.refStructureName,
        result.companyName,
        result.fieldName,
        result.plantNum,
        result.plantRow,
        result.zz,
        result.yy,
        result.xx,
        result.timestamp,
    ));
}


class DataInterpolatedRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findDataInterpolated(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp) {
        return getResults(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp, timestamp, this.sequelize);
    }

    async findDataInterpolatedRange(refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo) {
        return getResults(refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo, this.sequelize);
    }

}