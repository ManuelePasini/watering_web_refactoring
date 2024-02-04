const express = require('express');
const sequelize = require('../configs/dbConfig');

const {OptStateDto} = require('../dtos/optStateDto')

const UserService = require('../services/UserService');
const AuthenticationService = require('../services/AuthenticationService');
const AuthorizationService = require('../services/AuthorizationService')
const FieldService = require('../services/FieldService')

const fieldsRouter = express.Router();
const userService = new UserService(sequelize);
const authenticationService = new AuthenticationService(userService);
const authorizationService = new AuthorizationService(sequelize)
const fieldService = new FieldService(sequelize)

const UserInPlantRepository = require('../persistency/repository/UserInPlantRepository');
const { CreateFieldDto } = require('../dtos/createFieldDto')
const userInPlantRepository = new UserInPlantRepository(sequelize);

fieldsRouter.get('/', async (req, res) => {
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

fieldsRouter.put('/setOptState', async (req, res) => {
  let requestUserData = {userId: -1, partner: ''}
  try {
    requestUserData = await authenticationService.validateJwt(req.headers.authorization);
  } catch (error) {
    return res.status(403).json({message: 'Authentication failed'});
  }

  try {
    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.user, 'SetOpt')))
      return res.status(401).json({message: 'Unauthorized request'});

    if(!req.body && req.body === '')
      throw new Error('Body is empty');

    if(!req.body.validFrom || !req.body.validTo || !req.body.optimalState)
      return res.status(400).json({message: 'Invalid request'});

    const bodyRequest = new OptStateDto(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.thesis, req.body.validFrom, req.body.validTo, req.body.optimalState)

    await fieldService.createMatrixOptState(bodyRequest)

    return res.status(200).json({message: `Matrix opt state created with success`})
  } catch (error) {
    console.log(`Fail creating opt state caused by: ${error.message}`)
    return res.status(500).json({error: "Error on creating field opt matrix"})
  }

});

fieldsRouter.post('/wateringAdvice', async (req, res) => {
  let requestUserData = {userId: -1, partner: ''}
  try {
    requestUserData = await authenticationService.validateJwt(req.headers.authorization);
  } catch (error) {
    return res.status(403).json({message: 'Authentication failed'});
  }

  try {
    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.user, 'WA')))
      return res.status(401).json({message: 'Unauthorized request'});


    if((!req.body && req.body === '') || (!req.body.structureName || !req.body.companyName || !req.body.fieldName || !req.body.sectorName || !req.body.thesis))
      throw new Error('Body is not correct');

    const result = await fieldService.getCurrentWateringAdvice(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.thesis)

    return res.status(200).json(result)
  } catch (error) {
    console.log(`Fail get watering advice caused by: ${error.message}`)
    return res.status(500).json({error: "Error get watering advice"})
  }
});

fieldsRouter.put('/createFields', async (req, res) => {
  let requestUserData = {userId: -1, partner: ''}
  try {
    requestUserData = await authenticationService.validateJwt(req.headers.authorization);
  } catch (error) {
    return res.status(403).json({message: 'Authentication failed'});
  }

  try {
    if(!req.body && req.body === '')
      throw new Error('Body is empty');

    if(!(await authorizationService.isUserAuthorized(requestUserData.user, 'partner')))
      return res.status(401).json({message: 'Unauthorized request'});

    const body = req.body

    const requestDto = new CreateFieldDto(body)

    await fieldService.createTranscodingFields(requestUserData.affiliation, requestDto)

    return res.status(200).json()
  } catch (error) {
    console.log(`Error during fields creation caused by: ${error.message}`)
    return res.status(500).json({error: "Error during fields creation"})
  }
});

module.exports = fieldsRouter;