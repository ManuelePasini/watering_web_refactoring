export class CreateFieldDto {

  constructor(structures) {
    this.structures = structures
  }

}

export class StructureDto {

  constructor(companies) {
    this.companies = companies
  }

}

export class CompaniesDto {

  constructor(structureName, companies) {
    this.structureName = structureName
    this.companies = companies
  }

}

export class CompanyDto {

  constructor(companyName, fields) {
    this.companyName = companyName
    this.fields = fields
  }

}

export class FieldDto {

  constructor(fieldName, coltureType, sectors) {
    this.fieldName = fieldName;
    this.coltureType = coltureType;
    this.sectors = sectors;
  }

}

export class SectorDto {

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

export class ThesisDto {

  constructor(adviceWeight, thesisName, sensorNumber, sensors) {
    this.adviceWeight = adviceWeight
    this.thesisName = thesisName
    this.sensorNumber = sensorNumber
    this.sensors = sensors
  }

}

export class SensorDto {

  constructor(id, name, type, xx, yy, zz) {
    this.id = id
    this.name = name
    this.type = type
    this.xx = xx
    this.yy = yy
    this.zz = zz
  }

}