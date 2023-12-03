
class HumidityBinWrapper {

    constructor(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp, count, umidity_bin) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.plantNum = plantNum;
        this.plantRow = plantRow;
        this.timestamp = timestamp;
        this.count = count;
        this.umidity_bin = umidity_bin;
    }

}

module.exports = HumidityBinWrapper;