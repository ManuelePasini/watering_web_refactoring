const DeltaWrapper = require('../querywrappers/DeltaWrapper');
const {QueryTypes} = require("sequelize");

class DeltaRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findDelta(timestampFrom, timestampTo, refStructureName, companyName, fieldName, sectorname, thesis) {

        const queryString = `
            SELECT q1."refStructureName",
                   q1."companyName",
                   q1."fieldName",
                   q1."sectorname",
                   q1."thesis",
                   AVG("value") as "value",
                   EXTRACT(EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP(q1."timestamp"))) ::INT AS timestamp, 
             'Media Pot. Idr. Giornaliera' as "detectedValueTypeDescription"
            FROM (
                SELECT wa."refStructureName", wa."companyName", wa."fieldName", wa."sectorname", wa."thesis", di."timestamp", AVG (CASE WHEN di."value" > -300 THEN LN(ABS(di."value")) * weighted."weight"
                ELSE LN(ABS(-300)) * weighted."weight" END) as "value", di."xx", di."yy"
                FROM data_interpolated as di
                JOIN (
                SELECT DISTINCT "timestamp", "refStructureName", "companyName", "fieldName", "sectorname", "thesis"
                FROM watering_advice
                WHERE "timestamp" BETWEEN '${timestampFrom}' AND '${timestampTo}') as wa ON wa."timestamp" + 9 * 3600 = di."timestamp"
                AND di."refStructureName" = wa."refStructureName"
                AND di."companyName" = wa."companyName"
                AND di."fieldName" = wa."fieldName"
                AND di."sectorname" = wa."sectorname"
                AND di."thesis" = wa."thesis"
                JOIN (
                SELECT "refStructureName", "companyName", "fieldName", "sectorname", "thesis", "xx", "yy", "weight", fi."matrixId"
                FROM field_matrix as fi
                JOIN matrix_profile as mp ON fi."matrixId" = mp."matrixId"
                WHERE "refStructureName" = '${refStructureName}'
                AND "companyName" = '${companyName}'
                AND "fieldName" = '${fieldName}'
                AND "sectorname" = '${sectorname}'
                AND "thesis" = '${thesis}'
                AND fi."current" = 'true'
                ) as weighted ON weighted."refStructureName" = di."refStructureName"
                AND weighted."companyName" = di."companyName"
                AND weighted."fieldName" = di."fieldName"
                AND weighted."sectorname" = di."sectorname"
                AND weighted."thesis" = di."thesis"
                AND weighted."xx" = di."xx"
                AND weighted."yy" = di."yy"
                WHERE di."refStructureName" = '${refStructureName}'
                AND di."companyName" = '${companyName}'
                AND di."fieldName" = '${fieldName}'
                AND di."sectorname" = '${sectorname}'
                AND di."thesis" = '${thesis}'
                AND wa."timestamp" BETWEEN '${timestampFrom}' AND '${timestampTo}'
                GROUP BY wa."refStructureName", wa."companyName", wa."fieldName", wa."sectorname", wa."thesis", di."timestamp", di."xx", di."yy"
                ) as q1
            GROUP BY q1."refStructureName", q1."companyName", q1."fieldName", q1."sectorname", q1."thesis", q1."timestamp"
            UNION
            (
            SELECT sq1."refStructureName", sq1."companyName", sq1."fieldName", sq1."sectorname", sq1."thesis", "value", EXTRACT (EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP(sq2."timestamp"))):: INT AS timestamp, 'Media Pot. Idr. Ottimale' as "detectedValueTypeDescription"
            FROM (
                SELECT "refStructureName", "companyName", "fieldName", "sectorname", "thesis", ROUND(AVG (CASE WHEN "optValue" > -300 THEN LN(ABS("optValue")) * "weight"
                ELSE LN(ABS(-300)) * "weight" END):: numeric, 6) as "value", fm."matrixId"
                FROM field_matrix as fm
                JOIN matrix_profile as mp ON fm."matrixId" = mp."matrixId"
                WHERE "refStructureName" = '${refStructureName}'
                AND "companyName" = '${companyName}'
                AND "fieldName" = '${fieldName}'
                AND "sectorname" = '${sectorname}'
                AND "thesis" = '${thesis}'
                AND "current" = 'true'
                GROUP BY "refStructureName", "companyName", "fieldName", "sectorname", "thesis", fm."matrixId"
                ) as sq1
                CROSS JOIN (
                SELECT DISTINCT EXTRACT (EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP("timestamp"))):: INT AS timestamp
                FROM watering_advice
                WHERE TO_CHAR(TO_TIMESTAMP("timestamp"), 'YYYY-MM-DD') IN (
                SELECT DISTINCT TO_CHAR(TO_TIMESTAMP("timestamp"), 'YYYY-MM-DD') as "timestamp"
                FROM watering_advice
                WHERE "timestamp" BETWEEN '${timestampFrom}' AND '${timestampTo}')
                ) as sq2)
            ORDER BY "timestamp" DESC
        `;

        const results = await this.sequelize.query(queryString, {
           type: QueryTypes.SELECT,
           bind: {
               timestampFrom,
               timestampTo,
               refStructureName,
               companyName,
               fieldName,
               sectorname,
               thesis
           }
        });

        return results.map(result => new DeltaWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.sectorname,
            result.thesis,
            result.value,
            result.timestamp,
            result.detectedValueTypeDescription
        ));
    }


}

module.exports = DeltaRepository;