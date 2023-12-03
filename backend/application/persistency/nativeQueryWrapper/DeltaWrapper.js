
class DeltaWrapper {

    constructor(refStructureName, companyName, fieldName, plantNum, plantRow, value, timestamp, detectedValueTypeDescription) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.plantNum = plantNum;
        this.plantRow = plantRow;
        this.value = value;
        this.timestamp = timestamp;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
    }

}

module.exports = DeltaWrapper;