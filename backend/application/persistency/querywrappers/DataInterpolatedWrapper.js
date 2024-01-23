
class DataInterpolatedWrapper {

    constructor(refStructureName, companyName, fieldName, plantNum, plantRow, zz, yy, xx, timestamp, value) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.plantNum = plantNum;
        this.plantRow = plantRow;
        this.zz = zz;
        this.yy = yy;
        this.xx = xx;
        this.timestamp = timestamp;
        this.value = value;
    }

}

module.exports = DataInterpolatedWrapper;