
class DataInterpolatedWrapper {

    constructor(refStructureName, companyName, fieldName, sectorname, thesis, zz, yy, xx, timestamp, value) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.sectorname = sectorname;
        this.thesis = thesis;
        this.zz = zz;
        this.yy = yy;
        this.xx = xx;
        this.timestamp = timestamp;
        this.value = value;
    }

}

module.exports = DataInterpolatedWrapper;