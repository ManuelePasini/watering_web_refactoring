
class CreateFieldDto {

  constructor(structures) {
    this.structures = structures
  }

}

class StructureDto {

  constructor(companies) {
    this.companies = companies
  }

}

class CompaniesDto {

  constructor(structureName, companies) {
    this.structureName = structureName
    this.companies = companies
  }

}

class CompanyDto {

  constructor(companyName, fields) {
    this.companyName = companyName
    this.fields = fields
  }

}

class FieldDto {

  constructor(fieldName, coltureType, sectors) {
    this.fieldName = fieldName;
    this.coltureType = coltureType;
    this.sectors = sectors;
  }

}

class SectorDto {

  constructor(sectorName, wateringCapacity, initialWatering, maximumWatering, adviceTime, wateringType, theses) {
    this.sectorName = sectorName;
    this.wateringCapacity = wateringCapacity;
    this.initialWatering = initialWatering;
    this.maximumWatering = maximumWatering;
    this.adviceTime = adviceTime;
    this.wateringType = wateringType;
    this.theses = theses;
  }

}

class ThesisDto {

  constructor(adviceWeight, thesisName, sensorNumber, sensors) {
    this.adviceWeight = adviceWeight
    this.thesisName = thesisName
    this.sensorNumber = sensorNumber
    this.sensors = sensors
  }

}

class SensorDto {

  constructor(id, name, type, x, y, z) {
    this.id = id
    this.name = name
    this.type = type
    this.x = x
    this.y = y
    this.z = z
  }

}

module.exports = {CreateFieldDto, StructureDto, CompaniesDto, CompanyDto, FieldDto, SectorDto, ThesisDto, SensorDto}