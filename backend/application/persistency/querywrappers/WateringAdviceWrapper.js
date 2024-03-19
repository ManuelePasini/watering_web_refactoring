
class WateringAdviceWrapper {

    constructor(refStructureName, companyName, fieldName, detectedValueTypeDescription, sectorname, thesis, value, timestamp) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
        this.sectorname = sectorname;
        this.thesis = thesis;
        this.value = value;
        this.timestamp = timestamp;
    }

}

module.exports = WateringAdviceWrapper;