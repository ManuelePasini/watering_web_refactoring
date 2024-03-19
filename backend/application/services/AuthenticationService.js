const jwt = require("jsonwebtoken");
const hashPassword = require('../commons/hashPassword')
const jwtSecret = require('../commons/constants');


class AuthenticationService {

    constructor(userService) {
        this.userService = userService;
    }

    async generateJwt(request) {
        try {
            const user = await this.userService.findUser(request.username);

            if (!user)
                throw new Error('The mail does not exist');

            if(user.auth_type === 'token') {
                const match = (user.dataValues.affiliation === request.affiliation)
                if (!match)
                    throw new Error('Affiliation is invalid');
            } else {
                const match = (user.dataValues.pwd === request.password);
                if (!match)
                    throw new Error('Password is invalid');
            }

            const payload = {user: user.dataValues.userid, affiliation: user.dataValues.affiliation, auth_type: user.dataValues.auth_type}
            return jwt.sign(payload, jwtSecret, {expiresIn: "1h"});
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
                        if(decoded.user !== undefined && decoded.affiliation !== undefined && decoded.auth_type !== undefined)
                            resolve({user: decoded.user, affiliation: decoded.affiliation, auth_type: decoded.auth_type});
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