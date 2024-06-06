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
    if (!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userid, req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.plantRow, 'SetOpt')))
      return res.status(401).json({message: 'Unauthorized request'});

    if(!req.body.validFrom || !req.body.validTo || !req.body.optimalState)
      return res.status(400).json({message: 'Invalid request'});

    const bodyRequest = new OptStateDto(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.plantRow, req.body.validFrom, req.body.validTo, req.body.optimalState)

    const interpolatedPoints = await fieldService.findDistinctplantRowPoints(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.plantRow)

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
    if (!(await authorizationService.isUserAuthorizedByFieldAndId(requestUserData.userid, 'WA')))
      return res.status(401).json({message: 'Unauthorized request'});


    if (!req.body || !req.body.structureName || !req.body.companyName || !req.body.fieldName || !req.body.sectorName || !req.body.plantRow)
      throw new Error('Body is not correct');

    const result = await fieldService.getCurrentWateringAdvice(req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.plantRow)

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
  let requestUserData = { userid: -1, partner: '' }
  try {
    requestUserData = await authenticationService.validateJwt(req.headers.authorization);
  } catch (error) {
    return res.status(403).json({message: 'Authentication failed'});
  }

  try {
    if(!req.body && req.body === '')
      throw new Error('Body is empty');

    if (!(await authorizationService.isUserAuthorized(requestUserData.userid, 'partner')))
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


/**
 * @swagger
 * /fields/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/dripperInfo:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get information on dripper for a thesis
 *     description:  Get information on dripper for a thesis
 *     tags: [Field Operations]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *         description: The reference structure name
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *         description: The company name
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *         description: The field name
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *         description: The sector name
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *         description: The plantRow
 *       - in: query
 *         name: timestamp
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The timestamp in which find the information
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SensorDto'
 *       '400':
 *         description: Invalid request or thesis not found.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on retrieving data.
 */
fieldsRouter.get("/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/dripperInfo", async (req, res) => {
  const refStructureName = req.params.refStructureName;
  const companyName = req.params.companyName;
  const fieldName = req.params.fieldName;
  const sectorName = req.params.sectorName;
  const plantRow = req.params.plantRow;

  try {
    const user = await authenticationService.validateJwt(req.headers.authorization);
    if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.userid, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
      return res.status(401).json({ message: 'Unauthorized request' });
  } catch (error) {
    return res.status(403).json({ message: 'Authentication failed' });
  }

  try {
    const timestamp = req.query.timestamp ? req.query.timestamp : Date.now();

    const result = await fieldService.getDripperInfo(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

function checkOptState(dataInterpolatedPoints, list2) {
  if (dataInterpolatedPoints.points.length !== list2.length) return false;

  for (const elem1 of dataInterpolatedPoints.points) {
    const matchingElem2 = list2.find(elem2 => elem2.x === elem1.x && elem2.y === elem1.y && elem2.z === elem1.z);
    if (!matchingElem2) return false;
  }

  return true;
}

module.exports = fieldsRouter;