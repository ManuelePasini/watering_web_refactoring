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

const { CreateFieldDto } = require('../dtos/createFieldDto')


/**
 * @swagger
 * /fields/setOptState:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Set optimal state for a field
 *     description: Set the optimal state for a field.
 *     tags: [Field Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OptStateDto'
 *     responses:
 *       '200':
 *         description: Matrix opt state created successfully.
 *       '400':
 *         description: Invalid request or opt state matrix does not match.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on creating field opt matrix.
 */
fieldsRouter.put('/setOptState', async (req, res) => {
  let requestUserData = {userId: -1, partner: ''}
  try {
    requestUserData = await authenticationService.validateJwt(req.headers.authorization);
  } catch (error) {
    return res.status(403).json({message: 'Authentication failed'});
  }

  if(!req.body && req.body === '')
    throw new Error('Body is empty');

  try {
    if(!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.user, req.body.structureName, req.body.companyName,req.body.fieldName, req.body.sectorName, req.body.thesis, 'SetOpt')))
      return res.status(401).json({message: 'Unauthorized request'});

    if(!req.body.validFrom || !req.body.validTo || !req.body.optimalState)
      return res.status(400).json({message: 'Invalid request'});

    const bodyRequest = new OptStateDto(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.thesis, req.body.validFrom, req.body.validTo, req.body.optimalState)

    const interpolatedPoints = await fieldService.findDistinctThesisPoints(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.thesis)

    if(!checkOptState(interpolatedPoints, req.body.optimalState))
      return res.status(400).json({error: "Opt state matrix does not match"})

    await fieldService.createMatrixOptState(bodyRequest)

    return res.status(200).json({message: `Matrix opt state created with success`})
  } catch (error) {
    console.log(`Fail creating opt state caused by: ${error.message}`)
    return res.status(500).json({error: "Error on creating field opt matrix"})
  }

});

/**
 * @swagger
 * /fields/wateringAdvice:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Get watering advice for a field
 *     description: Get watering advice for a field
 *     tags: [Field Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WateringAdviceDtoRequest'
 *     responses:
 *       '200':
 *         description: Matrix opt state created successfully.
 *       '400':
 *         description: Invalid request or opt state matrix does not match.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on creating field opt matrix.
 */
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


    if(!req.body || !req.body.structureName || !req.body.companyName || !req.body.fieldName || !req.body.sectorName || !req.body.thesis)
      throw new Error('Body is not correct');

    const result = await fieldService.getCurrentWateringAdvice(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.thesis)

    return res.status(200).json(result)
  } catch (error) {
    console.log(`Fail get watering advice caused by: ${error.message}`)
    return res.status(500).json({error: "Error get watering advice"})
  }
});

/**
 * @swagger
 * /fields/createFields:
 *     put:
 *       security:
 *       - bearerAuth: []
 *       summary: Create fields
 *       description: Create fields based on the provided data
 *       tags: [Field Operations]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateFieldDto'
 *       responses:
 *         '200':
 *           description: Fields created successfully
 *         '400':
 *           description: Invalid request body
 *         '401':
 *           description: Unauthorized request
 *         '403':
 *           description: Authentication failed
 *         '500':
 *           description: Error during fields creation
 */
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

    const requestDto = new CreateFieldDto(body.structures)

    await fieldService.createTranscodingFields(requestUserData.affiliation, requestDto)

    return res.status(200).json()
  } catch (error) {
    console.log(`Error during fields creation caused by: ${error.message}`)
    return res.status(500).json({error: "Error during fields creation"})
  }
});

function checkOptState(dataInterpolatedPoints, list2) {
  if (dataInterpolatedPoints.points.length !== list2.length) return false;

  for (const elem1 of dataInterpolatedPoints.points) {
    const matchingElem2 = list2.find(elem2 => elem2.x === elem1.x && elem2.y === elem1.y && elem2.z === elem1.z);
    if (!matchingElem2) return false;
  }

  return true;
}

module.exports = fieldsRouter;