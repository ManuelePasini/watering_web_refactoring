
const UserService = require('./UserService')

class AuthorizationService {

  constructor(sequelize) {
    this.userService = new UserService(sequelize)
  }

  async isUserAuthorizedByEmail(userEmail, refStructureName, companyName, fieldName, plantNum, plantRow, action) {
    const userPermissions = await this.userService.findUserPermissionsByEmail(userEmail)
    const key = {
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      plantNum: plantNum,
      plantRow: plantRow
    };
    if(userPermissions.permissions.has(JSON.stringify(key)))
      return userPermissions.permissions.get(JSON.stringify(key)).includes(action)
    return false
  }

  async isUserAuthorizedByFieldAndId(id, refStructureName, companyName, fieldName, plantNum, plantRow, action) {
    const userPermissions = await this.userService.findUserPermissionsByFieldAndId(id)
    const key = {
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      plantNum: plantNum,
      plantRow: plantRow
    };
    if(userPermissions.permissions.has(JSON.stringify(key)))
      return userPermissions.permissions.get(JSON.stringify(key)).includes(action)
    return false
  }

  async isUserAuthorizedById(id, action) {
    const userPermissions = await this.userService.findUserPermissionsById(id)
    return userPermissions.includes(action)
  }

}

module.exports = AuthorizationService