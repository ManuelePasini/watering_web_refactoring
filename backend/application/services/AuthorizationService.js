
const UserService = require('./UserService')

class AuthorizationService {

  constructor(sequelize) {
    this.userService = new UserService(sequelize)
  }

  async isUserAuthorized(user, permission) {
    const userPermissions = await this.userService.findUserPermissions(user)
    if(userPermissions.role === 'admin') return true;
    return permission === userPermissions.role
  }

  async isUserAuthorizedByFieldAndId(user, refStructureName, companyName, fieldName, sectorName, thesis, action) {
    const userPermissions = await this.userService.findUserPermissions(user)
    if(userPermissions.role === 'admin') return true;
    const key = {
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      sectorName: sectorName,
      thesis: thesis
    };
    if(userPermissions.permissions.has(JSON.stringify(key)))
      return userPermissions.permissions.get(JSON.stringify(key)).includes(action)
    return false
  }

}

module.exports = AuthorizationService