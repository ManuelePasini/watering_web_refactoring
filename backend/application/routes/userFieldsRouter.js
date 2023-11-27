const express = require('express');
const sequelize = require('../configs/dbConfig');

const UserService = require('../services/UserService');
const AuthenticationService = require('../services/AuthenticationService');

const userFieldsRouter = express.Router();
const userService = new UserService(sequelize);
const authenticationService = new AuthenticationService(userService);

const UserInPlantRepository = require('../persistency/repository/UserInPlantRepository');
const userInPlantRepository = new UserInPlantRepository(sequelize);

userFieldsRouter.get('/', async (req, res) => {
   let userId;

   try {
       userId = await authenticationService.validateJwt(req.headers.authorization);
       if(!userId || userId === 'undefined')
           throw new Error('User not found');
   } catch (error) {
       return res.status(403).json({message:'authentication failed'});
   }

    try {
       const result = await userInPlantRepository.findAllUserFields(userId, req.query.timeFilterFrom, req.query.timeFilterTo);
       res.status(200).json(result);
   } catch (error) {
       res.status(500).json({message:error.message});
   }
});


module.exports = userFieldsRouter;