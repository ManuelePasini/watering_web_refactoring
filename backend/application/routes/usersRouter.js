const express = require('express');

const sequelize = require('../configs/dbConfig');

const UserService =  require('../services/UserService');
const { UserTokenResponse, UserTokenRequest } = require('../dtos/authenticationDto')
const AuthenticationService = require('../services/AuthenticationService');
const AuthorizationService = require('../services/AuthorizationService')

const usersRouter = express.Router();
const userService = new UserService(sequelize);
const authenticationService = new AuthenticationService(userService);
const authorizationService = new AuthorizationService(sequelize)

const {RegisterUsersDto, RegisterUserDto} = require('../dtos/registerUsersDto')
const { UserGrantsDto } = require('../dtos/userGrantsDto')

usersRouter.post("/login", async  (req, res) => {
    try {
        if(!req.body && req.body === '')
            throw new Error('Body is empty');

        const request = new UserTokenRequest(req.body.username, req.body.password, req.body.affiliation, req.body.auth_type);

        const token = await authenticationService.generateJwt(request);

        const responseDto = new UserTokenResponse(token);
        res.json(responseDto);
    } catch (error) {
        return res.status(500).json({error:error.toString()});
    }
});

usersRouter.get("/validateToken", async (req, res) => {
    try {
        const bearerHeader = req.headers.authorization;
        const requestUserData = await authenticationService.validateJwt(bearerHeader);
        res.json({message: `UserId: ${requestUserData.user}; Partner: ${requestUserData.affiliation}; Auth_Type: ${requestUserData.auth_type}`});
    } catch (error) {
        return res.status(403).json({error:error.toString()});
    }
});

usersRouter.get('/userFields', async (req, res) => {
    let requestUserData;

    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
        if(!requestUserData || requestUserData === 'undefined')
            throw new Error('User not found');
    } catch (error) {
        return res.status(403).json({message:'authentication failed'});
    }

    try {
        const result = await userInPlantRepository.findAllUserFields(requestUserData.userId, req.query.timeFilterFrom, req.query.timeFilterTo);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

usersRouter.put('/registerUsers', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        if(!(await authorizationService.isUserAuthorized(requestUserData.user, 'partner')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body === '')
            throw new Error('Body is empty');


        const request = new RegisterUsersDto(req.body.map(user => new RegisterUserDto(
          user.username,
          user.name,
          user.affiliation,
          user.password,
          user.authType,
        )));

        await userService.createUsers(request)
        return res.status(200).json({message: `Users created with success`})
    } catch (error) {
        console.log(`Fail creating user caused by: ${error.message}`)
        return res.status(505).json({error: "Error on creating user"})
    }

});

usersRouter.put('/createGrants', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        if(!(await authorizationService.isUserAuthorized(requestUserData.user, 'partner')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body === '')
            throw new Error('Body is empty');

        const requestDto = new UserGrantsDto(req.body)

        await userService.createUserGrants(requestUserData.affiliation, requestDto)

        return res.status(200).json({message: `Grants created with success`})
    } catch (error) {
        console.log(`Fail creating user grant caused by: ${error.message}`)
        return res.status(500).json({error: "Error on creating user grant"})
    }

});

module.exports = usersRouter;
