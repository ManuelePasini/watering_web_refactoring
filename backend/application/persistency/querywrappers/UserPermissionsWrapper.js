
class UserPermissionsWrapper {

  constructor(user, affiliation, role, permissions) {
    this.user = user
    this.affiliation = affiliation
    this.role = role
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