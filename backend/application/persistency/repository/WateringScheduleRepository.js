import { SCHEDULE_SAFE_INTERVAL } from '../../commons/constants.js';
import { Op, where } from "sequelize";


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
            console.error('Error on find watering events:', error);
        }
    }

    async updateWateringEvent(refStructureName, companyName, fieldName, sectorName, plantRow, date, wateringStart,
        wateringEnd, duration, enabled, expectedWater, advice, adviceTimestamp, userId, note) {
        try {
            this.WateringSchedule.removeAttribute('id')
            this.WateringSchedule.removeAttribute('userid')
            const activeEvent = await this.WateringSchedule.findOne({
                where: {
                    refStructureName: refStructureName,
                    companyName: companyName,
                    fieldName: fieldName,
                    sectorName: sectorName,
                    plantRow: plantRow,
                    latest: true,
                    date: date
                }
            })
            if (wateringStart - activeEvent.wateringStart < SCHEDULE_SAFE_INTERVAL && new Date(date) !== new Date(wateringStart)) {
                throw Error("Invalid watering start timestamp")
            }
            await this.WateringSchedule.update(
                {
                    latest: false
                }, {
                where: {
                    refStructureName: refStructureName,
                    companyName: companyName,
                    fieldName: fieldName,
                    sectorName: sectorName,
                    plantRow: plantRow,
                    latest: true,
                    date: date,
                        update_timestamp: {
                            [Op.gte]: Math.floor(activeEvent.dataValues.update_timestamp),
                            [Op.lt]: Math.ceil(activeEvent.dataValues.update_timestamp)
                        }
                }
            })
            const newEventModel = this.WateringSchedule.build({
                refStructureName: refStructureName,
                companyName: companyName,
                fieldName: fieldName,
                sectorName: sectorName,
                plantRow: plantRow,
                date: date,
                watering_start: wateringStart,
                watering_end: wateringEnd,
                duration: duration,
                enabled: enabled,
                latest: true,
                expected_water: expectedWater,
                advice: advice,
                advice_timestamp: adviceTimestamp,
                userId: userId,
                update_timestamp: Date.now() / 1000,
                note: note,
                evapotrans: activeEvent.evapotrans,
                r: activeEvent.r,
                pluv: activeEvent.pluv,
                delta: activeEvent.delta,
                kp: activeEvent.kp,
                ki: activeEvent.ki
            })
            const newEvent = await newEventModel.save()
            return newEvent;
        } catch (error) {
            console.error('Error on update watering event:', error);
        }
    }
}

export default WateringScheduleRepository;