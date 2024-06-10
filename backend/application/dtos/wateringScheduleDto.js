export class WateringScheduleResponse {

    constructor(refStructureName, companyName, fieldName, sectorName, plantRow, events) {
        this.refStructureName = refStructureName
        this.companyName = companyName
        this.fieldName = fieldName
        this.sectorName = sectorName
        this.plantRow = plantRow
        this.events = events
    }

}

export class WateringEventDto {

    constructor(date, wateringStart, wateringEnd, duration, enabled, expectedWater, advice, adviceTimestamp, updatedBy, updateTimestamp, note) {
        this.date = date;
        this.wateringStart = wateringStart;
        this.wateringEnd = wateringEnd;
        this.duration = duration;
        this.enabled = enabled;
        this.expectedWater = expectedWater;
        this.advice = advice;
        this.adviceTimestamp = adviceTimestamp;
        this.updatedBy = updatedBy;
        this.updateTimestamp = updateTimestamp;
        this.note = note;
    }
}