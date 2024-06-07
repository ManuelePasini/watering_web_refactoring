const { Op } = require("sequelize");

class WateringScheduleRepository {

    constructor(WateringSchedule, Users, sequelize) {
        this.WateringSchedule = WateringSchedule
        this.Users = Users
        this.sequelize = sequelize

        Users.hasMany(WateringSchedule, { foreignKey: 'userid' });
        WateringSchedule.belongsTo(Users, { foreignKey: 'userId' });
    }

    async getSchedule(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        try {
            this.WateringSchedule.removeAttribute('id')
            return (await this.WateringSchedule.findAll({
                attributes: ['refStructureName', 'companyName', 'fieldName', 'sectorName', 'plantRow', 'date',
                    ['watering_start', 'wateringStart'], ['watering_end', 'wateringEnd'], 'duration',
                    'enabled', ['expected_water', 'expectedWater'], 'advice', ['advice_timestamp', 'adviceTimestamp'],
                    ['update_timestamp', 'updateTimestamp'], 'note'],
                where: {
                    refStructureName: refStructureName,
                    companyName: companyName,
                    fieldName: fieldName,
                    sectorName: sectorName,
                    plantRow: plantRow,
                    latest: true,
                    date: {
                        [Op.gte]: new Date(parseFloat(timestampFrom) * 1000).toISOString().split('T')[0],
                        [Op.lte]: new Date(parseFloat(timestampTo) * 1000).toISOString().split('T')[0],
                    }
                },
                include: {
                    model: this.Users,
                    attributes: [['email', 'updatedBy']]
                },
            })).map(el => el.dataValues);
        } catch (error) {
            console.error('Error on find user:', error);
        }
    }
}

module.exports = WateringScheduleRepository;