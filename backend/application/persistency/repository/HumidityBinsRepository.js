import { HumidityBinWrapper } from '../querywrappers/HumidityBinWrapper.js';
import { HumidityBinEventWrapper } from '../querywrappers/HumidityBinEventWrapper.js';

import { QueryTypes, DataTypes } from 'sequelize';

class HumidityBinsRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow) {

        const query = `
            WITH interval_table AS (SELECT unnest(array['6*(-30, 0]', '5*(-100, -30]', '4*(-200, -100]', '3*(-300, -200]', '2*(-1500, -300]', '1*(-∞, -1500]']) AS humidity_bin)
            SELECT di."timestamp",
                   di."refStructureName",
                   di."companyName",
                   di."fieldName",
                   di."sectorName",
                   di."plantRow",
                   it.humidity_bin,
                   COALESCE(count(d."value"), 0) AS count
            FROM interval_table it
                CROSS JOIN (
                SELECT DISTINCT "timestamp", "refStructureName", "companyName", "fieldName", "sectorName", "plantRow"
                FROM data_interpolated
                WHERE "timestamp" >= '${timeFilterFrom}'
                AND "timestamp" <= '${timeFilterTo}'
                AND "refStructureName" = '${refStructureName}'
                AND "companyName" = '${companyName}'
                AND "fieldName" = '${fieldName}'
                AND "sectorName" = '${sectorName}'
                AND "plantRow" = '${plantRow}'
                ) di
                LEFT JOIN
                data_interpolated d
            ON di."timestamp" = d."timestamp"
                AND di."refStructureName" = d."refStructureName"
                AND di."companyName" = d."companyName"
                AND di."fieldName" = d."fieldName"
                AND di."sectorName" = d."sectorName"
                AND di."plantRow" = d."plantRow"
                AND d."value" BETWEEN -10000000 AND 0
                AND it.humidity_bin = CASE
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
            AND di."sectorName" = '${sectorName}'
            AND di."plantRow" = '${plantRow}'
            GROUP BY di."timestamp", di."refStructureName", di."companyName", di."fieldName", di."sectorName", di."plantRow", it.humidity_bin
            ORDER BY di."timestamp", di."fieldName", it.humidity_bin
        `;

        const results = await this.sequelize.query(query, {
           type: QueryTypes.SELECT,
           bind: {
               timeFilterFrom,
               timeFilterTo,
               refStructureName,
               companyName,
               fieldName,
               sectorName,
               plantRow
           }
        });

        return results.map(result => new HumidityBinWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.sectorName,
            result.plantRow,
            result.timestamp,
            result.count,
            result.humidity_bin
        ));
    }

    async findHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow) {

        const query = `SELECT DISTINCT "refStructureName",
                                       "companyName",
                                       "fieldName",
                                       "detectedValueTypeDescription",
                                       "sectorName",
                                       "plantRow",
                                       SUM("value") as value, 
                                       "timestamp"
                       FROM view_data_original
                       WHERE "detectedValueTypeId" = ANY '${detectedValueTypeId}'
                         AND "timestamp" >= '${timeFilterFrom}'
                         AND "timestamp" <= '${timeFilterTo}'
                         AND "refStructureName" = '${refStructureName}'
                         AND "companyName" = '${companyName}'
                         AND "fieldName" = '${fieldName}'
                         AND "sectorName" = '${sectorName}'
                         AND "plantRow" = '${plantRow}'
                       GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorName", "plantRow", "timestamp"
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
                sectorName,
                plantRow
            }
        });

        return results.map(result => new HumidityBinEventWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.detectedValueTypeDescription,
            result.sectorName,
            result.plantRow,
            result.value,
            result.timestamp
        ));
    }

}

export default HumidityBinsRepository;