
class UserPermissionsWrapper {

  constructor(idUser, userEmail, partner, permissions) {
    this.idUser = idUser
    this.userEmail = userEmail
    this.partner = partner
    this.permissions = permissions
  }

}

class GroupPermissions {

  constructor(supergroup, actions) {
    this.supergroup = supergroup
    this.actions = actions
  }

}

module.exports = {UserPermissionsWrapper, GroupPermissions}