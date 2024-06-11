import { Router } from 'express';

import sequelize from '../configs/dbConfig.js';

import WateringScheduleService from '../services/WateringScheduleService.js';
import AuthenticationService from '../services/AuthenticationService.js';
import AuthorizationService from '../services/AuthorizationService.js';


const wateringScheduleRouter = Router();
const wateringScheduleService = new WateringScheduleService(sequelize);
const authenticationService = new AuthenticationService(sequelize);
const authorizationService = new AuthorizationService(sequelize)

/**
 * @swagger
 * /wateringSchedule/{refStructureName}/{companyName}/{fieldName}/{sectorName}/{plantRow}/calendar:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get watering calendar for a thesis
 *     description:  Get watering calendar for a thesis
 *     tags: [Watering Schedule Operation]
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
 *         name: timeFilterFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeFilterTo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WateringScheduleResponse'
 *       '400':
 *         description: Invalid request or thesis not found.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on retrieving data.
 */
wateringScheduleRouter.get("/:refStructureName/:companyName/:fieldName/:sectorName/:plantRow/calendar", async (req, res) => {
    const refStructureName = req.params.refStructureName;
    const companyName = req.params.companyName;
    const fieldName = req.params.fieldName;
    const sectorName = req.params.sectorName;
    const plantRow = req.params.plantRow;

    try {
        const user = await authenticationService.validateJwt(req.headers.authorization);
        if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.userid, refStructureName, companyName, fieldName, sectorName, plantRow, 'WA')))
            return res.status(401).json({ message: 'Unauthorized request' });
    } catch (error) {
        return res.status(403).json({ message: 'Authentication failed' });
    }

    try {
        const timestampFrom = req.query.timeFilterFrom
        const timestampTo = req.query.timeFilterTo

        const result = await wateringScheduleService.getSchedule(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo);
        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

/**
 * @swagger
 * /wateringSchedule/updateWateringEvent:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a watering event
 *     description:  Update a watering event with information given in body
 *     tags: [Watering Schedule Operation]
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WateringEventUpdateRequest'
 *     responses:
 *       '200':
 *         description: Field updated successfully
 *       '400':
 *         description: Invalid request.
 *       '401':
 *         description: Unauthorized request.
 *       '403':
 *         description: Authentication failed.
 *       '500':
 *         description: Error on update data.
 */
wateringScheduleRouter.put("/updateWateringEvent", async (req, res) => {
    let user
    try {
        user = await authenticationService.validateJwt(req.headers.authorization);
    } catch (error) {
        console.log(error)
        return res.status(403).json({ message: 'Authentication failed' });
    }

    if (!req.body && req.body === '')
        return res.status(400).json({ message: 'Invalid request' })

    if (!(await authorizationService.isUserAuthorizedByFieldAndId(user.userid, req.body.structureName, req.body.companyName, req.body.fieldName, req.body.sectorName, req.body.plantRow, 'WA')))
        return res.status(401).json({ message: 'Unauthorized request' });

    try {
        const result = await wateringScheduleService.updateWateringEvent(req.body, user.userid)
        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


export default wateringScheduleRouter;