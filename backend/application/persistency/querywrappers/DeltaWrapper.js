
class DeltaWrapper {

    constructor(refStructureName, companyName, fieldName, sectorname, thesis, value, timestamp, detectedValueTypeDescription) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.sectorname = sectorname;
        this.thesis = thesis;
        this.value = value;
        this.timestamp = timestamp;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
    }

}

module.exports = DeltaWrapper;