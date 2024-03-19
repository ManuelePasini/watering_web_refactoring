
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
    if(!userPermissions.permissions || userPermissions.permissions.length === 0) return false;

    const requestedFieldKey = JSON.stringify({
      refStructureName:refStructureName,
      companyName:companyName,
      fieldName:fieldName,
      sectorName:sectorName,
      thesis:thesis
    });

    for(const field of userPermissions.permissions) {
      const fieldKey = JSON.stringify({
        refStructureName:field.refStructureName,
        companyName:field.companyName,
        fieldName:field.fieldName,
        sectorName:field.sectorname,
        thesis:field.thesis
      });

      if(requestedFieldKey === fieldKey)
        return field.permissions.includes(action)
    }
    return false
  }

}

module.exports = AuthorizationService