const HumidityBinWrapper = require('../nativeQueryWrapper/HumidityBinWrapper');
const HumidityBinEventWrapper = require('../nativeQueryWrapper/HumidityBinEventWrapper');

const {QueryTypes, DataTypes} = require('sequelize');

class HumidityBinsRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow) {

        const query = `
            WITH interval_table AS (SELECT unnest(array['6*(-30, 0]', '5*(-100, -30]', '4*(-200, -100]', '3*(-300, -200]', '2*(-1500, -300]', '1*(-∞, -1500]']) AS umidity_bin)
            SELECT di."timestamp",
                   di."refStructureName",
                   di."companyName",
                   di."fieldName",
                   di."plantNum",
                   di."plantRow",
                   it.umidity_bin,
                   COALESCE(count(d."value"), 0) AS count
            FROM interval_table it
                CROSS JOIN (
                SELECT DISTINCT "timestamp", "refStructureName", "companyName", "fieldName", "plantNum", "plantRow"
                FROM data_interpolated
                WHERE "timestamp" >= '${timeFilterFrom}'
                AND "timestamp" <= '${timeFilterTo}'
                AND "refStructureName" = '${refStructureName}'
                AND "companyName" = '${companyName}'
                AND "fieldName" = '${fieldName}'
                AND "plantNum" = '${plantNum}'
                AND "plantRow" = '${plantRow}'
                ) di
                LEFT JOIN
                data_interpolated d
            ON di."timestamp" = d."timestamp"
                AND di."refStructureName" = d."refStructureName"
                AND di."companyName" = d."companyName"
                AND di."fieldName" = d."fieldName"
                AND di."plantNum" = d."plantNum"
                AND di."plantRow" = d."plantRow"
                AND d."value" BETWEEN -10000000 AND 0
                AND it.umidity_bin = CASE
                WHEN d."value" BETWEEN -30 AND 0 THEN '6*(-30, 0]'
                WHEN d."value" BETWEEN -100 AND -30 THEN '5*(-100, -30]'
                WHEN d."value" BETWEEN -200 AND -100 THEN '4*(-200, -100]'
                WHEN d."value" BETWEEN -300 AND -200 THEN '3*(-300, -200]'
                WHEN d."value" BETWEEN -1500 AND -300 THEN '2*(-1500, -300]'
                WHEN d."value" BETWEEN -10000000 AND -1500 THEN '1*(-∞, -1500]'
                ELSE NULL
            END
            WHERE di."timestamp" >= '${timeFilterFrom}'
            AND di."timestamp" <= '${timeFilterTo}'
            AND di."refStructureName" = '${refStructureName}'
            AND di."companyName" = '${companyName}'
            AND di."fieldName" = '${fieldName}'
            AND di."plantNum" = '${plantNum}'
            AND di."plantRow" = '${plantRow}'
            GROUP BY di."timestamp", di."refStructureName", di."companyName", di."fieldName", di."plantNum", di."plantRow", it.umidity_bin
            ORDER BY di."timestamp", di."fieldName", it.umidity_bin
        `;

        const results = await this.sequelize.query(query, {
           type: QueryTypes.SELECT,
           bind: {
               timeFilterFrom,
               timeFilterTo,
               refStructureName,
               companyName,
               fieldName,
               plantNum,
               plantRow
           }
        });

        return results.map(result => new HumidityBinWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.plantNum,
            result.plantRow,
            result.timestamp,
            result.count,
            result.umidity_bin
        ));
    }

    async findHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow) {

        const query = `SELECT DISTINCT "refStructureName",
                                       "companyName",
                                       "fieldName",
                                       "detectedValueTypeDescription",
                                       "plantNum",
                                       "plantRow",
                                       SUM("value") as value, 
                                       "timestamp"
                       FROM view_data_original
                       WHERE "detectedValueTypeId" = ANY '${detectedValueTypeId}'
                         AND "timestamp" >= '${timeFilterFrom}'
                         AND "timestamp" <= '${timeFilterTo}'
                         AND "refStructureName" = '${refStructureName}'
                         AND "companyName" = '${companyName}'
                         AND ("fieldName" IS NULL
                          OR "fieldName" = '${fieldName}')
                         AND "plantNum" = '${plantNum}'
                         AND "plantRow" = '${plantRow}'
                       GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "plantNum", "plantRow", "timestamp"
                       ORDER BY "timestamp" ASC`;

        const results = await this.sequelize.query(query, {
            type: QueryTypes.SELECT,
            bind: {
                detectedValueTypeId,
                timeFilterFrom,
                timeFilterTo,
                refStructureName,
                companyName,
                fieldName,
                plantNum,
                plantRow
            }
        });

        return results.map(result => new HumidityBinEventWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.detectedValueTypeDescription,
            result.plantNum,
            result.plantRow,
            result.value,
            result.timestamp
        ));
    }

}

module.exports = HumidityBinsRepository;