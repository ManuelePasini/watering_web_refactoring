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

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/groundWaterPotential', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message:'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['GRND_WATER_G', 'GRND_WATER_W', 'GRND_WATER'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/dripperAndPluv', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['DRIPPER', 'PLUV_CURR'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }


});

//TODO
fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/wateringAdvice', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getWaterAdvice(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/airTemp', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['AIR_TEMP', 'AIR_TEMP_FOL'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/groundTemp', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['GRND_TEMP'];

        const result = await fieldService.getAverageByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/humidityEvents', async (req, res) => {

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!user) throw new Error("Not found user");
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;
        const detectedValueTypeId = ['DRIPPER', 'PLUV_CURR', 'IGA'];

        const result = await fieldService.getHumidityEventsByFieldReference(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/electCondition', async (req, res) => {

    try {
        await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }


    try {

        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const colture = req.query.colture;
        const coltureType = req.query.coltureType;
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/humidityBins', async (req, res) => {

    try {
        await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/dynamicHeatmap', async (req, res) => {

    try {
        await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }
    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getDataInterpolatedRange(refStructureName, companyName, fieldName, plantNum, plantRow, timeFilterFrom, timeFilterTo);

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/heatmap', async (req, res) => {

    try {
        await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const timestamp = req.query.timestamp;

        const result = await fieldService.getDataInterpolated(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp);

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/statisticsChart', async (req, res) => {

    try {
        await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const refStructureName = req.params.refStructureName;
        const companyName = req.params.companyName;
        const fieldName = req.params.fieldName;
        const plantNum = req.params.plantNum;
        const plantRow = req.params.plantRow;

        const result = await fieldService.getInterpolatedMeans(refStructureName, companyName, fieldName, plantNum, plantRow);

        res.status(200).json(new InterpolatedDataResponse(result));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

});

fieldChartRouter.get('/:refStructureName/:companyName/:fieldName/:plantNum/:plantRow/delta', async (req, res) => {

    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const plantNum = req.params.plantNum;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if(!(await authorizationService.isUserAuthorizedByFieldAndId(user.userId, refStructureName, companyName, fieldName, plantNum, plantRow, 'DeltaChart')))
            return res.status(401).json({message: 'Unauthorized request'});
    } catch (error) {
        return res.status(403).json({message: 'Authentication failed'});
    }

    try {
        const timeFilterFrom = req.query.timeFilterFrom;
        const timeFilterTo = req.query.timeFilterTo;

        const result = await fieldService.getDelta(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});



module.exports = fieldChartRouter;