const jwt = require("jsonwebtoken");
const hashPassword = require('../commons/hashPassword')
const jwtSecret = require('../commons/constants');


class AuthenticationService {

    constructor(userService) {
        this.userService = userService;
    }

    async generateJwt(request) {
        try {
            const user = await this.userService.findUserByEmail(request.email);

            if (!user)
                throw new Error('The mail does not exist');

            const match = (user.dataValues.password === hashPassword(request.password));

            if (!match)
                throw new Error('The password is invalid');

            const payload = {userId: user.dataValues.userId, partner: user.dataValues.partner}
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
                        if(decoded.userId !== undefined && decoded.partner !== undefined)
                            resolve({userId: decoded.userId, partner: decoded.partner});
                        else reject(new Error('Authentication failed: token verify error'));
                    }
                });
            });
        } else {
            throw new Error('Authentication failed: bearer header not found.');
        }
    }

}

module.exports = AuthenticationService;