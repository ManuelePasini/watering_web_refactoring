import { Router } from 'express';

import sequelize from '../configs/dbConfig.js';

import UserService from '../services/UserService.js';
import { UserTokenResponse, UserTokenRequest } from '../dtos/authenticationDto.js';
import AuthenticationService from '../services/AuthenticationService.js';
import AuthorizationService from '../services/AuthorizationService.js';

const usersRouter = Router();
const userService = new UserService(sequelize);
const authenticationService = new AuthenticationService(userService);
const authorizationService = new AuthorizationService(sequelize)

import { RegisterUsersDto, RegisterUserDto } from '../dtos/registerUsersDto.js';
import { UserGrantsDto } from '../dtos/userGrantsDto.js';

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user and generate token
 *     tags: [User route]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserTokenRequest'
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /validateToken:
 *   get:
 *     summary: Validate JWT token
 *     tags: [User route]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful token validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
usersRouter.get("/validateToken", async (req, res) => {
    try {
        const bearerHeader = req.headers.authorization;
        const requestUserData = await authenticationService.validateJwt(bearerHeader);
        res.json({ message: `UserId: ${requestUserData.userid}; Partner: ${requestUserData.affiliation}; Auth_Type: ${requestUserData.auth_type}` });
    } catch (error) {
        return res.status(403).json({error:error.toString()});
    }
});

/**
 * @swagger
 * /userFields:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve user permissions for fields
 *     description: Retrieve the permissions for fields associated with the authenticated user.
 *     tags: [User route]
 *     parameters:
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserFieldPermissions'
 *       '403':
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
usersRouter.get('/userFields', async (req, res) => {
    let requestUserData;

    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
        if(!requestUserData)
            throw new Error('User not found');
    } catch (error) {
        return res.status(403).json({message:'authentication failed'});
    }

    try {
        const result = await userService.findUserPermissions(requestUserData.userid, req.query.timeFilterFrom, req.query.timeFilterTo);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

/**
 * @swagger
 * /registerUsers:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Register users
 *     tags: [User route]
 *     description: Endpoint to register users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUsersDto'
 *     responses:
 *       '200':
 *         description: Users created successfully.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on creating user.
 */
usersRouter.put('/registerUsers', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        if (!(await authorizationService.isUserAuthorized(requestUserData.userid, 'partner')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body.users && req.body.users.length > 0)
            throw new Error('Body is empty');


        const request = new RegisterUsersDto(req.body.users.map(user => new RegisterUserDto(
          user.username,
          user.name,
          requestUserData.affiliation,
          user.password,
          user.authType,
        )));

        const result = await userService.createUsers(request)
        return res.status(200).json({message: `Users created with success`})
    } catch (error) {
        console.log(`Fail creating user caused by: ${error.message}`)
        return res.status(505).json({error: "Error on creating user"})
    }

});

/**
 * @swagger
 * /createGrants:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Create grants
 *     tags: [User route]
 *     description: Endpoint to create grants.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserGrantsDto'
 *     responses:
 *       '200':
 *         description: Grants created successfully.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on creating grants.
 */
usersRouter.put('/createGrants', async (req, res) => {
    let requestUserData = {userId: -1, partner: ''}
    try {
        requestUserData = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        if (!(await authorizationService.isUserAuthorized(requestUserData.userid, 'partner')))
            return res.status(401).json({message: 'Unauthorized request'});

        if(!req.body && req.body === '')
            throw new Error('Body is empty');

        const requestDto = new UserGrantsDto(req.body.grants)

        await userService.createUserGrants(requestUserData.affiliation, requestDto)

        return res.status(200).json({message: `Grants created with success`})
    } catch (error) {
        console.log(`Fail creating user grant caused by: ${error.message}`)
        return res.status(500).json({error: "Error on creating user grant"})
    }

});

export default usersRouter;
