
export class UserGrantsDto {

  constructor(grants) {
    this.grants = grants
  }

}

export class UserGrantDto {

  constructor(structureName, companyName, fieldName, sectorName, plantRow, permits, userId) {
    this.structureName = structureName;
    this.companyName = companyName;
    this.fieldName = fieldName;
    this.sectorName = sectorName;
    this.plantRow = plantRow;
    this.permits = permits;
    this.userId = userId;
  }

}