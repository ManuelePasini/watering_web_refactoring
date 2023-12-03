
class WateringAdviceWrapper {

    constructor(refStructureName, companyName, fieldName, detectedValueTypeDescription, plantNum, plantRow, value, timestamp) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
        this.plantNum = plantNum;
        this.plantRow = plantRow;
        this.value = value;
        this.timestamp = timestamp;
    }

}

module.exports = WateringAdviceWrapper;