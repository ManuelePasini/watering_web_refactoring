import { SCHEDULE_SAFE_INTERVAL, TABLES } from "../commons/constants.js";
import { WateringEvent, WateringScheduleResponse } from "../dtos/wateringScheduleDto.js";
import WateringAdviceRepository from "../persistency/repository/WateringAdviceRepository.js";
import WateringScheduleRepository from "../persistency/repository/WateringScheduleRepository.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";

const dtoConverter = new DtoConverter;

class WateringScheduleService {
    wateringScheduleRepository: WateringScheduleRepository
    wateringAdviceRepository: WateringAdviceRepository
    userActionService: UserActionService

    constructor(wateringScheduleRepository: any, wateringAdviceRepository: any, userActionService: any) {
        this.wateringScheduleRepository = wateringScheduleRepository
        this.wateringAdviceRepository = wateringAdviceRepository
        this.userActionService = userActionService
    }

    async getSectorSchedules(sectorId: number, timeFilterFrom: number, timeFilterTo: number) {
        const results = await this.wateringScheduleRepository.getSectorSchedules(sectorId, timeFilterFrom, timeFilterTo)
        if (results.length == 0) {
            return new WateringScheduleResponse(sectorId, [])
        }
        return dtoConverter.convertCalendarWrapper(results)[0];
    }

    async getUserWateringEvents(filteringSectorIds: number[], timeFilterFrom: number, timeFilterTo: number, userId: number) {
        const results = await this.wateringScheduleRepository.getUserWateringEvents(filteringSectorIds, timeFilterFrom, timeFilterTo, userId);
        return dtoConverter.convertCalendarWrapper(results);
    }

    async updateWateringEvent(userId: number, eventId: number, fieldsToUpdate: Partial<WateringEvent>) {
        const updatedEventInstance = await this.wateringScheduleRepository.updateWateringEvent(eventId, fieldsToUpdate);
        if (updatedEventInstance) {
            const eventData = updatedEventInstance.get({ plain: true });
            await this.userActionService.logUpdate(userId, TABLES.WATERING_EVENT, eventId, null, eventData);
            return eventId;
        }
        return null;
    }

    async scheduleWateringEvent(userId: number, eventId: number) {
        const updatedEventInstance = await this.wateringScheduleRepository.updateWateringEvent(eventId, {scheduled: true});
        if (updatedEventInstance) {
            await this.userActionService.logScheduling(userId, TABLES.WATERING_EVENT, eventId, null);
            return eventId;
        }
        return null;
    }

    async isEventUpdateAllowed(eventId: number, newWateringStart: number) {
        const followingEvent = await this.wateringScheduleRepository.findFollowingEvent(eventId)
        if (followingEvent) {
            return followingEvent.wateringStart - SCHEDULE_SAFE_INTERVAL > newWateringStart;
        }
        return true
    }

    async validateEventForScheduling(eventId: number) {
        const event = await this.wateringScheduleRepository.findEvent(eventId);

        if (!event) {
            const error = new Error("Event not found");
            (error as any).code = "EVENT_NOT_FOUND"; 
            throw error;
        }

        if (event.advice === null) {
            const error = new Error("Event has not yet been computed");
            (error as any).code = "EVENT_NOT_COMPUTED";
            throw error;
        }
    }

    async createWateringEvent(userId: number, event: WateringEvent) {
        const newEventId = await this.wateringScheduleRepository.createWateringEvent(event)
        if (newEventId) {
            await this.userActionService.logCreation(userId, TABLES.WATERING_EVENT, newEventId, null);
        }
        return newEventId
    }

    async createPeriodicWateringEvent(userId: number, sectorId: number, timestampFrom: number, timestampTo: number) {

        let wateringFrequenciesList = await this.wateringAdviceRepository.getSectorWateringFrequency(sectorId, timestampFrom, timestampTo);
        wateringFrequenciesList.sort((a: { validFrom: number; }, b: { validFrom: number; }) => (a.validFrom || 0) - (b.validFrom || 0));

        let wateringTimestamp = timestampFrom;
        let eventIds = [];
        let paramIndex = 0;

        while (wateringTimestamp <= timestampTo) {

            while (paramIndex < wateringFrequenciesList.length) {
                const param = wateringFrequenciesList[paramIndex];
                const validFrom = param.validFrom ?? 0;
                const validTo = param.validTo ?? Infinity;

                if (wateringTimestamp >= validFrom && wateringTimestamp <= validTo) {
                    break;
                } else if (wateringTimestamp > validTo) {
                    paramIndex++;
                } else {
                    throw new Error(`No valid watering frequency found for timestamp ${wateringTimestamp}`);
                }
            }

            if (paramIndex >= wateringFrequenciesList.length) {
                throw new Error(`No valid watering frequency found for timestamp ${wateringTimestamp}`);
            }

            const currentParam = wateringFrequenciesList[paramIndex];
            const currentFrequency = currentParam.wateringFrequency * 3600;

            const newEventId = await this.createWateringEvent(userId, {
                sectorId,
                wateringStart: wateringTimestamp,
                expectedWater: 0
            } as WateringEvent);

            eventIds.push(newEventId);

            wateringTimestamp += currentFrequency;
        }

        return eventIds;
    }

    async deleteWateringEvents(userId: number, sectorId: number, timestamp: number) {
        const deletedEventsIds = await this.wateringScheduleRepository.deleteWateringEvents(sectorId, timestamp)
        if (deletedEventsIds) {
            await this.userActionService.logDeletion(userId, TABLES.WATERING_EVENT, deletedEventsIds, null);
        }
        return deletedEventsIds
    }
}

export default WateringScheduleService;
