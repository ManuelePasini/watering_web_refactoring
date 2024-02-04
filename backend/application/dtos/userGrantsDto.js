
class UserGrantsDto {

  constructor(grants) {
    this.grants = grants
  }

}

class UserGrantDto {

  constructor(structureName, companyName, fieldName, sectorName, thesis, applications, userId) {
    this.structureName = structureName;
    this.companyName = companyName;
    this.fieldName = fieldName;
    this.sectorName = sectorName;
    this.thesis = thesis;
    this.applications = applications;
    this.userId = userId;
  }

}

module.exports = {UserGrantsDto, UserGrantDto}