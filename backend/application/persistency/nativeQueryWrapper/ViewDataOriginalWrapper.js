
class ViewDataOriginalWrapper {

    constructor(refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType, detectedValueTypeDescription, value, timestamp) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.plantNum = plantNum;
        this.plantRow = plantRow;
        this.colture = colture;
        this.coltureType = coltureType;
        this.detectedValueTypeDescription = detectedValueTypeDescription;
        this.value = value;
        this.timestamp = timestamp;
    }

}

module.exports = ViewDataOriginalWrapper;