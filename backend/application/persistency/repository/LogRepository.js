import { SCHEDULE_SAFE_INTERVAL } from '../../commons/constants.js';
import { Op, where } from "sequelize";


class LogRepository {

    constructor(Log, sequelize) {
        this.Log = Log
        this.sequelize = sequelize
    }

    async getLogs(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        try {
            this.Log.removeAttribute('id')
            return (await this.Log.findAll({
                where: {
                    refStructureName: refStructureName,
                    companyName: companyName,
                    fieldName: fieldName,
                    sectorName: sectorName,
                    plantRow: plantRow,
                    timestamp: {
                        [Op.gt]: timestampFrom,
                        [Op.lt]: timestampTo
                    }
                }
            }));
        } catch (error) {
            console.error('Error on find watering events:', error);
        }
    }
}


export default LogRepository;