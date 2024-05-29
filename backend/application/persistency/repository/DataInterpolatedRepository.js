const {DataInterpolatedDistinctPoints, DataInterpolatedDistinctPoint} = require('../querywrappers/DataInterpolatedDistinctPoints')

const DataInterpolatedWrapper = require('../querywrappers/DataInterpolatedWrapper');
const DataInterpolatedMeanWrapper = require('../querywrappers/DataInterpolatedMeanWrapper');

const {QueryTypes} = require('sequelize');

const getResults = async (refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo, sequelize) => {

    const query = `
        SELECT DISTINCT "refStructureName",
                        "companyName",
                        "fieldName",
                        "sectorName",
                        "plantRow",
                        "zz",
                        "yy",
                        "xx",
                        "timestamp",
                        "value"
        FROM data_interpolated
        WHERE "refStructureName" = '${refStructureName}'
          AND "companyName" = '${companyName}'
          AND "fieldName" = '${fieldName}'
          AND "sectorName" = '${sectorName}'
          AND "plantRow" = '${plantRow}'
          AND "timestamp" >= '${timestampFrom}'
          AND "timestamp" <= '${timestampTo}'
          AND ("zz" = 0 OR "zz" IS NULL)
        ORDER BY "refStructureName", "companyName", "fieldName", "sectorName", "plantRow", "timestamp", "zz", "yy", "xx"`;

    const results = await sequelize.query(query,
        {
            type: QueryTypes.SELECT,
            bind: {
                refStructureName,
                companyName,
                fieldName,
                sectorName,
                plantRow,
                timestampFrom,
                timestampTo
            }
        }
    );

    return results.map(result => new DataInterpolatedWrapper(
        result.refStructureName,
        result.companyName,
        result.fieldName,
        result.sectorName,
        result.plantRow,
        result.zz,
        result.yy,
        result.xx,
        result.timestamp,
        result.value
    ));
}


class DataInterpolatedRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findDataInterpolated(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp) {
        return getResults(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp, timestamp, this.sequelize);
    }

    async findDataInterpolatedRange(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        return getResults(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo, this.sequelize);
    }

    async findInterpolatedMeans(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {

        const query = `
            SELECT "zz", "yy", "xx", AVG(value * -1)::numeric AS mean, STDDEV(value) ::numeric AS std
            FROM data_interpolated
            WHERE "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND "fieldName" = '${fieldName}'
              AND "sectorName" = '${sectorName}'
              AND "plantRow" = '${plantRow}'
              AND "timestamp" >= '${timestampFrom}'
              AND "timestamp" <= '${timestampTo}'
              AND "value" < 0
            GROUP BY "zz", "yy", "xx"
            ORDER BY "zz", "yy", "xx"
        `;

        const results = await this.sequelize.query(query,
            {
                type: QueryTypes.SELECT,
                bind: {
                    refStructureName,
                    companyName,
                    fieldName,
                    sectorName,
                    plantRow
                }
            }
        );


        return results.map(result => new DataInterpolatedMeanWrapper(
            result.zz,
            result.yy,
            result.xx,
            result.mean,
            result.std
        ));
    }

    async findDistinctPlantRowPoints(refStructureName, companyName, fieldName, sectorName, plantRow) {

        const query = `
            SELECT "zz", "yy", "xx"
            FROM data_interpolated
            WHERE "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND "fieldName" = '${fieldName}'
              AND "sectorName" = '${sectorName}'
              AND "plantRow" = '${plantRow}'
            GROUP BY "zz", "yy", "xx"
            ORDER BY "zz", "yy", "xx"
        `;

        const results = await this.sequelize.query(query,
          {
              type: QueryTypes.SELECT,
              bind: {
                  refStructureName,
                  companyName,
                  fieldName,
                  sectorName,
                  plantRow
              }
          }
        );

        const points = results.map(result => new DataInterpolatedDistinctPoint(
          result.xx,
          result.yy,
          result.zz
        ));

        return new DataInterpolatedDistinctPoints(points)
    }

}

module.exports = DataInterpolatedRepository;