
class UserFieldPermissions {

  constructor(user, affiliation, role, permissions) {
    this.user = user
    this.affiliation = affiliation
    this.role = role
    this.permissions = permissions
  }

}

class UserFieldPermission {

  constructor(refStructureName, companyName, fieldName, sectorName, plantRow, permissions) {
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.plantRow = plantRow
    this.permissions = permissions
  }

}

module.exports = {UserFieldPermissions, UserFieldPermission}