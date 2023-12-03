const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const jwtSecret = require('../commons/constants');
const hash = crypto.createHash('sha512');

const hashpassword = (password) => {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    return hash.digest('hex');
}


class AuthenticationService {

    constructor(userService) {
        this.userService = userService;
    }

    async generateJwt(request) {
        try {
            const user = await this.userService.findUserByEmail(request.email);

            if (!user)
                throw new Error('The mail does not exist');

            const match = (user.dataValues.password === hashpassword(request.password));

            if (!match)
                throw new Error('The password is invalid');

            const payload = {userId: user.dataValues.userId}
            return jwt.sign(payload, jwtSecret, {expiresIn: "24h"});
        } catch (error) {
            throw new Error(`Error on generating jwt caused by: ${error}`);
        }
    }

    async validateJwt(header) {
        if (typeof header !== 'undefined' && header !== '') {
            const bearerToken = header.split(' ')[1];
            return new Promise( (resolve, reject) => {
                jwt.verify(bearerToken, jwtSecret, (err, decoded) => {
                    if (err) {
                        reject(new Error('Authentication failed: token verify error'));
                    } else {
                        resolve(decoded.userId);
                    }
                });
            });
        } else {
            throw new Error('Authentication failed: bearer header not found.');
        }
    }

}

module.exports = AuthenticationService;