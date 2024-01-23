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

usersRouter.post("/login", async  (req, res) => {
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

usersRouter.get("/validateToken", async (req, res) => {
    try {
        const bearerHeader = req.headers.authorization;
        const requestUserData = await authenticationService.validateJwt(bearerHeader);
        res.json({message: `UserId: ${requestUserData.userId}; Partner: ${requestUserData.partner}`});
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

usersRouter.put('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/createUser', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const plantNum = req.params.plantNum;
    const plantRow = req.params.plantRow;

    try {

        if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'CU')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body === '')
            throw new Error('Body is empty');


        const email = req.body.email
        const password = req.body.password
        const name = req.body.name
        const surname = req.body.surname
        const partner = requestUserData.partner

        const userCreated = await userService.createUser(email, password, name, surname, partner)
        const userInFieldCreated = await userService.createUserInField(userCreated.userId, partner, refStructureName, companyName, fieldName, plantNum, plantRow, false)

        return res.status(200).json({message: `User ${userCreated.email} created with success`})
    } catch (error) {
        console.log(`Fail creating user for field ${refStructureName}/${companyName}/${fieldName}/${plantNum}/${plantRow} caused by: ${error.message}`)
        return res.status(505).json({error: "Error on creating user"})
    }

});

usersRouter.put('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/createGrant', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const plantNum = req.params.plantNum;
    const plantRow = req.params.plantRow;

    try {

        if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'SP')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body === '')
            throw new Error('Body is empty');


        const userToGrantemail = req.body.email
        const permit = req.body.permit

        if(permit === 'PAR')
            return res.status(403).json({message: 'Unauthorized request'});

        const userToGrant = await userService.findUserByEmail(userToGrantemail)
        if(userToGrant.partner !== requestUserData.partner)
            return res.status(403).json({message: 'Unauthorized request'});

        const permitCreated = await userService.createUserPermits(userToGrant.userId, permit, requestUserData.partner, refStructureName, companyName, fieldName, plantNum, plantRow)
        if(!permitCreated) return res.status(500).json({error: "Error on creating user grant"})

        return res.status(200).json({message: `Grant ${permit} to user ${userToGrant.email} created with success`})
    } catch (error) {
        console.log(`Fail creating user grant for field ${refStructureName}/${companyName}/${fieldName}/${plantNum}/${plantRow} caused by: ${error.message}`)
        return res.status(500).json({error: "Error on creating user grant"})
    }

});

module.exports = usersRouter;
