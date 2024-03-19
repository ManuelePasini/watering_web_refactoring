
class ViewDataOriginalWrapper {

    constructor(refStructureName, companyName, fieldName, sectorname, thesis, colture, coltureType, detectedValueTypeDescription, value, timestamp) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.sectorname = sectorname;
        this.thesis = thesis;
        this.colture = colture;
        this.coltureType = coltureType;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
        this.value = value;
        this.timestamp = timestamp;
    }

}

module.exports = ViewDataOriginalWrapper;