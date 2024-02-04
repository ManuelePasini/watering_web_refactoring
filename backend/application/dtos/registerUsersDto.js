
class RegisterUsersDto {

  constructor(users) {
    this.users = users;
  }

}

class RegisterUserDto {

  constructor(username, name, affiliation, password, authType) {
    this.username = username
    this.name = name
    this.affiliation = affiliation
    this.password = password
    this.authType = authType
  }

}

module.exports = {RegisterUsersDto, RegisterUserDto}