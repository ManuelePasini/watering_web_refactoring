const {DataInterpolatedDistinctPoints, DataInterpolatedDistinctPoint} = require('../querywrappers/DataInterpolatedDistinctPoints')

const DataInterpolatedWrapper = require('../querywrappers/DataInterpolatedWrapper');
const DataInterpolatedMeanWrapper = require('../querywrappers/DataInterpolatedMeanWrapper');

const {QueryTypes} = require('sequelize');

const getResults = async (refStructureName, companyName, fieldName, sectorname, thesis, timestampFrom, timestampTo, sequelize) => {

    const query = `
        SELECT DISTINCT "refStructureName",
                        "companyName",
                        "fieldName",
                        "sectorname",
                        "thesis",
                        "zz",
                        "yy",
                        "xx",
                        "timestamp",
                        "value"
        FROM data_interpolated
        WHERE "refStructureName" = '${refStructureName}'
          AND "companyName" = '${companyName}'
          AND ("fieldName" = '' OR "fieldName" = '${fieldName}')
          AND "sectorname" = '${sectorname}'
          AND "thesis" = '${thesis}'
          AND "timestamp" >= '${timestampFrom}'
          AND "timestamp" <= '${timestampTo}'
          AND ("zz" = 0 OR "zz" IS NULL)
        ORDER BY "refStructureName", "companyName", "fieldName", "sectorname", "thesis", "timestamp", "zz", "yy", "xx"`;

    const results = await sequelize.query(query,
        {
            type: QueryTypes.SELECT,
            bind: {
                refStructureName,
                companyName,
                fieldName,
                sectorname,
                thesis,
                timestampFrom,
                timestampTo
            }
        }
    );

    return results.map(result => new DataInterpolatedWrapper(
        result.refStructureName,
        result.companyName,
        result.fieldName,
        result.sectorname,
        result.thesis,
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

    async findDataInterpolated(refStructureName, companyName, fieldName, sectorname, thesis, timestamp) {
        return getResults(refStructureName, companyName, fieldName, sectorname, thesis, timestamp, timestamp, this.sequelize);
    }

    async findDataInterpolatedRange(refStructureName, companyName, fieldName, sectorname, thesis, timestampFrom, timestampTo) {
        return getResults(refStructureName, companyName, fieldName, sectorname, thesis, timestampFrom, timestampTo, this.sequelize);
    }

    async findInterpolatedMeans(refStructureName, companyName, fieldName, sectorname, thesis) {

        const query = `
            SELECT "zz", "yy", "xx", AVG(value * -1)::numeric AS mean, STDDEV(value) ::numeric AS std
            FROM data_interpolated
            WHERE "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND ("fieldName" = '' OR "fieldName" = '${fieldName}')
              AND "sectorname" = '${sectorname}'
              AND "thesis" = '${thesis}'
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
                    sectorname,
                    thesis
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

    async findDistinctThesisPoints(refStructureName, companyName, fieldName, sectorname, thesis) {

        const query = `
            SELECT "zz", "yy", "xx"
            FROM data_interpolated
            WHERE "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND "fieldName" = '${fieldName}'
              AND "sectorname" = '${sectorname}'
              AND "thesis" = '${thesis}'
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
                  sectorname,
                  thesis
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