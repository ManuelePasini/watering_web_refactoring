const WateringScheduleRepository = require('../persistency/repository/WateringScheduleRepository');
const DtoConverter = require('./DtoConverter');

const initUser = require('../persistency/model/User');
const initWateringSchedule = require('../persistency/model/WateringSchedule');
const { WateringScheduleResponse } = require('../dtos/wateringScheduleDto');
const dtoConverter = new DtoConverter();

class WateringScheduleService {

    constructor(sequelize) {
        this.wateringScheduleRepository = new WateringScheduleRepository(initWateringSchedule(sequelize), initUser(sequelize), sequelize);
    }

    async getSchedule(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        const results = await this.wateringScheduleRepository.getSchedule(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo)
        if (results.length == 0) {
            return new WateringScheduleResponse(refStructureName, companyName, fieldName, sectorName, plantRow, [])
        }
        return dtoConverter.convertWateringScheduleWrapper(results)
    }

}

module.exports = WateringScheduleService;