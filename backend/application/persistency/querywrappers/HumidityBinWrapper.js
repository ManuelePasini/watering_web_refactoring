
class HumidityBinWrapper {

    constructor(refStructureName, companyName, fieldName, sectorname, thesis, timestamp, count, umidity_bin) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.sectorname = sectorname;
        this.thesis = thesis;
        this.timestamp = timestamp;
        this.count = count;
        this.umidity_bin = umidity_bin;
    }

}

module.exports = HumidityBinWrapper;