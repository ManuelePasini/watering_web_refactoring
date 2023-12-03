const express = require('express');

const sequelize = require('../configs/dbConfig');

const UserService =  require('../services/UserService');
const { UserTokenResponse, UserTokenRequest } = require('../dtos/authenticationDto')
const AuthenticationService = require('../services/AuthenticationService');

const userAuthenticationRouter = express.Router();
const userService = new UserService(sequelize);
const authenticationService = new AuthenticationService(userService);

userAuthenticationRouter.post("/login", async  (req, res) => {
    try {
        if(!req.body && req.body === '')
            throw new Error('Body is empty');

        const request = new UserTokenRequest(req.body.email, req.body.password);

        const token = await authenticationService.generateJwt(request);

        const responseDto = new UserTokenResponse(token);
        res.json(responseDto);
    } catch (error) {
        return res.status(500).json({error:error.toString()});
    }
});

userAuthenticationRouter.get("/validate", async (req, res) => {
    try {
        const bearerHeader = req.headers.authorization;
        const userId = await authenticationService.validateJwt(bearerHeader);
        res.json({message: `UserId: ${userId}`});
    } catch (error) {
        return res.status(403).json({error:error.toString()});
    }
});


module.exports = userAuthenticationRouter;
