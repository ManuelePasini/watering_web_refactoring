const express = require('express');
const sequelize = require('../configs/dbConfig');

const fieldChartRouter = express.Router();
const UserService =  require('../services/UserService');
const userService = new UserService(sequelize);
const AuthenticationService = require('../services/AuthenticationService');
const AuthorizationService = require('../services/AuthorizationService')
const FieldService = require('../services/FieldService');

const authenticationService = new AuthenticationService(userService);
const { InterpolatedDataResponse } = require('../dtos/interpolatedDataDto')
const authorizationService = new AuthorizationService(sequelize)
const fieldService = new FieldService(sequelize);


/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/groundWaterPotential:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves ground water potential data
 *     tags: [Field Chart Data]
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
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *         description: Colture type
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Time filter from
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *         description: Time filter to
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/groundWaterPotential', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['GRND_WATER_G', 'GRND_WATER_W', 'GRND_WATER'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/dripperAndPluv:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves dripper and pluv data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/dripperAndPluv', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['DRIPPER', 'PLUV_CURR'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }


});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/dripper:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves dripper data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/dripper', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['DRIPPER'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }


});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/pluv:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves pluv data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/pluv', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['PLUV_CURR'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }


});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/wateringAdvice:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves watering advice data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/wateringAdvice', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getWaterAdvice(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/airTemp:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves air temperature data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/airTemp', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['AIR_TEMP', 'AIR_TEMP_FOL'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/groundTemp:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves ground temperature data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/groundTemp', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['GRND_TEMP'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/humidityEvents:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves humidity events data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/humidityEvents', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['DRIPPER', 'PLUV_CURR', 'IGA'];

        const result = await fieldService.getHumidityEventsByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/electCondition:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves ec average data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/electCondition', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }
    
    try {
        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/humidityBins:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves humidity bins data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/humidityBins', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/dynamicHeatmap:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves dynamic heatmap data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/dynamicHeatmap', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }
    
    try {
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getDataInterpolatedRange(refStructureName, companyName, fieldName, sectorName, plantRow, timeFilterFrom, timeFilterTo);

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/heatmap:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves heatmap data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/heatmap', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const timestamp = req.query.timeFilterFrom;

        const result = await fieldService.getDataInterpolated(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/statisticsChart:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves statistics data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/statisticsChart', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'MO')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {

        const result = await fieldService.getInterpolatedMeans(refStructureName, companyName, fieldName, sectorName, plantRow);

        res.status(200).json(new InterpolatedDataResponse(result));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

/**
 * @swagger
 * /fieldCharts/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/delta:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves delta data
 *     tags: [Field Chart Data]
 *     parameters:
 *       - in: path
 *         name: refStructureName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: plantRow
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: colture
 *         schema:
 *           type: string
 *         description: Colture
 *       - in: query
 *         name: coltureType
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/delta', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.user, refStructureName, companyName, fieldName, sectorName, plantRow, 'WA')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getDelta(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});



module.exports = fieldChartRouter;