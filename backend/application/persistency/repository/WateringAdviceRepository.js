const WateringAdviceWrapper = require('../querywrappers/WateringAdviceWrapper');
const {QueryTypes} = require("sequelize");

class WateringAdviceRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findWaterAdvice(timefilterFrom, timefilterTo, refStructureName, companyName, fieldName, sectorname, thesis, colture, coltureType) {

        const queryString = `
            SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            "detectedValueTypeDescription",
                            "sectorname",
                            "thesis",
                            MAX("value") as value, rounded_timestamp
            FROM (
                (
                SELECT DISTINCT "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorname", "thesis", SUM ("value") as value, ((3600*24) * (timestamp / (3600*24)):: INT) as rounded_timestamp
                FROM view_data_original
                WHERE "detectedValueTypeId" IN ('DRIPPER', 'PLUV_CURR')
                AND "timestamp" >= '${timefilterFrom}'
                AND "timestamp" <= '${timefilterTo}'
                AND "refStructureName" = '${refStructureName}'
                AND "companyName" = '${companyName}'
                AND ("fieldName" IS NULL OR "fieldName" = '${fieldName}')
                AND "sectorname" = '${sectorname}'
                AND "thesis" = '${thesis}'
                AND "colture" = '${colture}'
                AND "coltureType" = '${coltureType}'
                GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorname", "thesis", rounded_timestamp
                ORDER BY rounded_timestamp ASC
                )
            UNION
            (SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            'Advice' as "detectedValueTypeDescription",
                            "sectorname",
                            "thesis",
                            0 as value, ((3600*24) * (timestamp / (3600*24))::INT) as rounded_timestamp
            FROM view_data_original
            WHERE "detectedValueTypeId" IN ('DRIPPER')
              AND "timestamp" >= '${timefilterFrom}'
              AND "timestamp" <= '${timefilterTo}'
              AND "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND ("fieldName" IS NULL OR "fieldName" = '${fieldName}')
              AND "sectorname" = '${sectorname}'
              AND "thesis" = '${thesis}'
              AND "colture" = '${colture}'
              AND "coltureType" = '${coltureType}'
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorname", "thesis", rounded_timestamp
            ORDER BY rounded_timestamp ASC)
            UNION
            (SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            "detectedValueTypeDescription",
                            "sectorname",
                            "thesis",
                            AVG(-"value") as value,
                  ((3600*24) * (timestamp / (3600*24))::INT + (3600*24)) as rounded_timestamp
            FROM view_data_original
            WHERE "detectedValueTypeId" IN ('ET0')
              AND "timestamp" >= '${timefilterFrom}' - (3600*24)
              AND "timestamp" <= '${timefilterTo}'
              AND "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND ("fieldName" IS NULL OR "fieldName" = '${fieldName}')
              AND "sectorname" = '${sectorname}'
              AND "thesis" = '${thesis}'
              AND "colture" = '${colture}'
              AND "coltureType" = '${coltureType}'
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorname", "thesis", rounded_timestamp
            ORDER BY rounded_timestamp ASC)
            UNION
            (SELECT DISTINCT "refStructureName",
                            "companyName",
                            "fieldName",
                            'Advice' as "detectedValueTypeDescription",
                            "sectorname",
                            "thesis",
                            CASE WHEN BOOL_OR("wateringAdvice") = true THEN "advice" ELSE AVG("evapotrans") END as value,
                  ((3600*24) * (timestamp / (3600*24))::INT) as rounded_timestamp
            FROM watering_advice
            WHERE "timestamp" >= '${timefilterFrom}'
              AND "timestamp" < '${timefilterTo}'
              AND "refStructureName" = '${refStructureName}'
              AND "companyName" = '${companyName}'
              AND ("fieldName" IS NULL
               OR "fieldName" = '${fieldName}')
              AND "sectorname" = '${sectorname}'
              AND "thesis" = '${thesis}'
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "advice", "sectorname", "thesis", rounded_timestamp
            ORDER BY rounded_timestamp ASC)
                ) A
            GROUP BY "refStructureName", "companyName", "fieldName", "detectedValueTypeDescription", "sectorname", "thesis", rounded_timestamp
            ORDER BY rounded_timestamp ASC, "detectedValueTypeDescription" ASC
        `;

        const results = await this.sequelize.query(queryString, {
            type: QueryTypes.SELECT,
            bind: {
                timefilterFrom,
                timefilterTo,
                refStructureName,
                companyName,
                fieldName,
                sectorname,
                thesis,
                colture,
                coltureType
            }
        });

        return results.map(result => new WateringAdviceWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.detectedValueTypeDescription,
            result.sectorname,
            result.thesis,
            result.value,
            result.rounded_timestamp
        ));
    }

}

module.exports = WateringAdviceRepository;