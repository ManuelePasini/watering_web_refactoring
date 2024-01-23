
class UserPermitsDto {

  constructor(userPermits) {
    this.userPermits = userPermits
  }

}

class UserPermitData {

  constructor(email, permit, refStructureName, companyName, fieldName, plantNum, plantRow) {
    this.email = email;
    this.permit = permit;
    this.refStructureName = refStructureName;
    this.companyName = companyName;
    this.fieldName = fieldName;
    this.plantNum = plantNum;
    this.plantRow = plantRow;
  }

}

module.exports = {UserPermitsDto, UserPermitData}