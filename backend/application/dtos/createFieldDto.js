
class FieldCreateDto {

  constructor(fields) {
    this.fields = fields
  }

}

class FieldData {

  constructor(fieldId, refStructureId, refStructureName, companyId, companyName, fieldName, parcelCode, address, plant, latitude, longitude, sensors) {
    this.fieldId = fieldId;
    this.refStructureId = refStructureId;
    this.refStructureName = refStructureName;
    this.companyId = companyId;
    this.companyName = companyName;
    this.fieldName = fieldName;
    this.parcelCode = parcelCode;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.plant = plant;
    this.sensors = sensors;
  }

}

class SensorData {

  constructor(nodeId, nodeDescription, refNode, sensorNumber, doProfile, xx, yy, zz) {
    this.nodeId = nodeId;
    this.nodeDescription = nodeDescription;
    this.refNode = refNode;
    this.sensorNumber = sensorNumber;
    this.doProfile = doProfile;
    this.xx = xx;
    this.yy = yy;
    this.zz = zz;
  }

}

module.exports = {FieldCreateDto, NodeData: FieldData, SensorData}