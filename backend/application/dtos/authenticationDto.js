
class UserTokenRequest {

    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

}

class UserTokenResponse {

    constructor(token) {
        this.token = token;
    }

}

module.exports = { UserTokenResponse, UserTokenRequest};