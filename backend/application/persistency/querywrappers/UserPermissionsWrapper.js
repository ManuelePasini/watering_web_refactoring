
class UserFieldPermissions {

  constructor(user, affiliation, role, permissions) {
    this.user = user
    this.affiliation = affiliation
    this.role = role
    this.permissions = permissions
  }

}

class UserFieldPermission {

  constructor(refStructureName, companyName, fieldName, sectorname, thesis, permissions) {
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorname = sectorname
    this.thesis = thesis
    this.permissions = permissions
  }

}

module.exports = {UserFieldPermissions, UserFieldPermission}