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
const { FieldCreateDto } = require('../dtos/createFieldDto')
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

fieldsRouter.put('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/setOptState', async (req, res) => {
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
    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'SetOpt')))
      return res.status(401).json({message: 'Unauthorized request'});

    if(!req.body && req.body === '')
      throw new Error('Body is empty');

    if(!req.body.timestampFrom || !req.body.timestampTo || !req.body.matrixDataList || !req.body.matrixId)
      return res.status(400).json({message: 'Invalid request'});

    const bodyRequest = new OptStateDto(req.body.matrixId, refStructureName, companyName, fieldName, plantRow, plantNum, req.body.timestampFrom, req.body.timestampTo, req.body.matrixDataList)

    await fieldService.createMatrixOptState(bodyRequest)

    return res.status(200).json({message: `Matrix opt state for field ${refStructureName}/${companyName}/${fieldName}/${plantNum}/${plantRow} created with success`})
  } catch (error) {
    console.log(`Fail creating opt state for field ${refStructureName}/${companyName}/${fieldName}/${plantNum}/${plantRow} caused by: ${error.message}`)
    return res.status(500).json({error: "Error on creating field opt matrix"})
  }

});

fieldsRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/wateringAdvice', async (req, res) => {
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
    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'WA')))
      return res.status(401).json({message: 'Unauthorized request'});

    const result = await fieldService.getCurrentWateringAdvice(refStructureName, companyName, fieldName, plantNum, plantRow)

    return res.status(200).json(result)
  } catch (error) {
    console.log(`Fail get watering advice for field ${refStructureName}/${companyName}/${fieldName}/${plantNum}/${plantRow} caused by: ${error.message}`)
    return res.status(500).json({error: "Error get watering advice"})
  }
});

fieldsRouter.put('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/createField', async (req, res) => {
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
    if(!req.body && req.body === '')
      throw new Error('Body is empty');

    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'CF')))
      return res.status(401).json({message: 'Unauthorized request'});

    const body = req.body

    const parsed = new FieldCreateDto(body)

    await fieldService.createTranscodingFields(requestUserData.partner, refStructureName, companyName, fieldName, plantNum, plantRow, parsed)

    return res.status(200).json()
  } catch (error) {
    console.log(`Fail get watering advice for field caused by: ${error.message}`)
    return res.status(500).json({error: "Error get watering advice"})
  }
});

module.exports = fieldsRouter;