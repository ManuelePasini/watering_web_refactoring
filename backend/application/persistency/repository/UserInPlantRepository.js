const UserInFieldWrapper = require('../querywrappers/UserInFieldWrapper');

const {QueryTypes} = require('sequelize');

class UserInPlantRepository {

    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async findAllUserFields(userId, timeFilterFrom, timeFilterTo){
        const query = `SELECT DISTINCT tf."refStructureName",
                            tf."companyName",
                            tf."fieldName",
                            tf."plantNum",
                            tf."plantRow",
                            "colture",
                            "coltureType"
            FROM transcoding_field AS tf
                     JOIN (SELECT "refStructureName", "companyName", "fieldName", "plantNum", "plantRow"
                           FROM user_in_plant
                           WHERE "userId" = ${userId}) AS sq
                          ON tf."refStructureName" = sq."refStructureName"
                     INNER JOIN (SELECT DISTINCT "refStructureName", "companyName", "fieldName", "plantNum", "plantRow"
                                 FROM view_data_original
                                 WHERE timestamp >= ${timeFilterFrom}
                                   AND timestamp <= ${timeFilterTo}) AS vdo
                                ON tf."refStructureName" = vdo."refStructureName"
                                    AND tf."companyName" = vdo."companyName"
                                    AND tf."fieldName" = vdo."fieldName"
                                    AND tf."plantNum" = vdo."plantNum"
                                    AND tf."plantRow" = vdo."plantRow"
                                    AND tf."companyName" = sq."companyName"
                                    AND (tf."fieldName" IS NULL OR tf."fieldName" = sq."fieldName")
                                    AND tf."plantNum" = sq."plantNum"
                                    AND tf."plantRow" = sq."plantRow"
            ORDER BY tf."refStructureName", tf."companyName", tf."fieldName", tf."plantNum", tf."plantRow"`;

        const results = await this.sequelize.query(query, {
            type: QueryTypes.SELECT,
            bind: {
                userId,
                timeFilterFrom,
                timeFilterTo
            }
        });

        return results.map(result => new UserInFieldWrapper(
            result.refStructureName,
            result.companyName,
            result.fieldName,
            result.plantNum,
            result.plantRow,
            result.colture,
            result.coltureType
        ));
    }

}

module.exports = UserInPlantRepository;