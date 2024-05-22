
class UserGrantsDto {

  constructor(grants) {
    this.grants = grants
  }

}

class UserGrantDto {

  constructor(structureName, companyName, fieldName, sectorName, plantRow, applications, userId) {
    this.structureName = structureName;
    this.companyName = companyName;
    this.fieldName = fieldName;
    this.sectorName = sectorName;
    this.plantRow = plantRow;
    this.applications = applications;
    this.userId = userId;
  }

}

module.exports = {UserGrantsDto, UserGrantDto}