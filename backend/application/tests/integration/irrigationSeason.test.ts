import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import type { Knex } from 'knex';

import { loginUser, setupDb, table } from '../utils.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../const.js';

describe('Watering Schedule Lifecycle Integration Test', () => {
    let db: Knex;
    let container: Awaited<ReturnType<typeof setupDb>>['container'];
    let app: Express;
    let authToken: string;

    // Timestamps
    const START_DATE = Date.now() / 1000 + 86400; // Starts from tomorrow
    const END_DATE = START_DATE + 86400 * 10; // 10 days after start

    const TEST_SECTOR_ID = 2;
    const TEST_THESIS_1_ID = 2;
    const TEST_THESIS_2_ID = 3;

    let createdEventIds: number[] = [];

    beforeAll(async () => {
        const setup = await setupDb();

        db = setup.db;
        container = setup.container;

        app = (await import('../../src/app.js')).app;

        authToken = await loginUser(
            app,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        );
    });

    afterAll(async () => {
        if (db) {
            await db.destroy();
        }

        if (container) {
            await container.stop();
        }
    });

    /**
     * STEP 0: Set thesis algorithm parameters
     * Set thesis parameters for daily irrigations
     */
    it('should set up thesis watering parameters', async () => {
        await request(app)
            .put(`/theses/${TEST_THESIS_1_ID}/wateringParams`)
            .set('Authorization', `Bearer ${authToken}`)
            .query({ validFrom: START_DATE - 1 })
            .send({
                maxWatering: 4,
                minWatering: 0.5,
                wateringBaseline: 1.5,
                wateringFrequency: 24,
                ki: 12,
                kp: 5,
                errorFunction: 'potential_error',
                description: 'Test PI watering parameters',
            })
            .expect(200);

        await request(app)
            .put(`/theses/${TEST_THESIS_2_ID}/wateringParams`)
            .set('Authorization', `Bearer ${authToken}`)
            .query({ validFrom: START_DATE - 1 })
            .send({
                maxWatering: 4,
                minWatering: 0.5,
                wateringBaseline: 1.5,
                wateringFrequency: 24,
                ki: 12,
                kp: 5,
                errorFunction: 'potential_error',
                description: 'Test PI watering parameters',
            })
            .expect(200);

        const thesis1Params = await table(
            db,
            'watering_algorithm_params'
        )
            .where('thesis_id', TEST_THESIS_1_ID)
            .andWhere('valid_from', '<', END_DATE)
            .andWhere(function () {
                this.where('valid_to', '>', START_DATE)
                    .orWhereNull('valid_to');
            });

        expect(thesis1Params).toHaveLength(1);

        const thesis2Params = await table(
            db,
            'watering_algorithm_params'
        )
            .where('thesis_id', TEST_THESIS_2_ID)
            .andWhere('valid_from', '<', END_DATE)
            .andWhere(function () {
                this.where('valid_to', '>', START_DATE)
                    .orWhereNull('valid_to');
            });

        expect(thesis2Params).toHaveLength(1);
    });

    /**
     * STEP 1: Generate Calendar
     * Create events for the next 10 days
     */
    it('should generate a watering calendar for the sector', async () => {
        const res = await request(app)
            .post(`/wateringSchedule/${TEST_SECTOR_ID}/createCalendar`)
            .set('Authorization', `Bearer ${authToken}`)
            .query({
                timestampFrom: START_DATE,
                timestampTo: END_DATE,
            })
            .expect(200);

        const eventIds = res.body.eventIds as number[];

        expect(eventIds).toBeDefined();
        expect(eventIds.length).toBeGreaterThan(0);

        createdEventIds = eventIds;

        // DB Check
        const count = await table(db, 'watering_events')
            .where('sector_id', TEST_SECTOR_ID)
            .andWhere('watering_start', '>=', START_DATE)
            .andWhere('watering_start', '<=', END_DATE)
            .count('id as c')
            .first();

        expect(Number(count?.c)).toBe(createdEventIds.length);
    });

    /**
     * STEP 2: View Schedule
     */
    it('should retrieve the generated events', async () => {
        const res = await request(app)
            .get(`/wateringSchedule/${TEST_SECTOR_ID}/calendar`)
            .set('Authorization', `Bearer ${authToken}`)
            .query({
                timeFilterFrom: START_DATE,
                timeFilterTo: END_DATE,
            })
            .expect(200);

        const sectorData = res.body;

        expect(sectorData).toBeDefined();
        expect(sectorData.events.length).toBeGreaterThan(0);

        // Ensure default state
        expect(sectorData.events[0].scheduled).toBe(false);

        expect(sectorData.events.length).toBe(
            createdEventIds.length
        );

        sectorData.events.forEach((event: { id: number }) => {
            expect(createdEventIds).toContain(event.id);
        });
    });

    /**
     * STEP 3: Update & Plan a Specific Event
     */
    it('should update a specific event details', async () => {
        const targetEventId = createdEventIds[0];

        const updatePayload = {
            wateringStart: START_DATE + 3600,
            expectedWater: 3,
            note: 'Manual adjustment for heat',
            enabled: true,
        };

        await request(app)
            .put(
                `/wateringSchedule/${TEST_SECTOR_ID}/${targetEventId}/update`
            )
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatePayload)
            .expect(200);

        const record = await table(db, 'watering_events')
            .where({ id: targetEventId })
            .first();

        expect(record).toBeDefined();
        expect(record!.watering_start).toBe(
            updatePayload.wateringStart
        );
        expect(record!.expected_water).toBe(
            updatePayload.expectedWater
        );
        expect(record!.note).toBe(updatePayload.note);
        expect(record!.enabled).toBe(updatePayload.enabled);
    });

    /**
     * STEP 4: Confirm/Schedule the Event
     */
    it('should schedule the event (confirm execution)', async () => {
        const targetEventId = createdEventIds[0];

        await table(db, 'watering_events')
            .where('id', targetEventId)
            .update({
                advice: 2.5,
                watering_end: START_DATE + 7200,
                duration: 1,
            });

        await request(app)
            .put(
                `/wateringSchedule/${TEST_SECTOR_ID}/${targetEventId}/schedule`
            )
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        const record = await table(db, 'watering_events')
            .where({ id: targetEventId })
            .first();

        expect(record).toBeDefined();
        expect(record!.scheduled).toBe(true);
    });

    /**
     * STEP 5: End Season (Cleanup)
     * Should delete future UNSCHEDULED events, but keep the SCHEDULED one
     */
    it('should end irrigation season and remove unscheduled future events', async () => {
        const cutOffDate = START_DATE + 4000;

        await request(app)
            .post(
                `/wateringSchedule/${TEST_SECTOR_ID}/endIrrigationSeason`
            )
            .set('Authorization', `Bearer ${authToken}`)
            .query({ timestamp: cutOffDate })
            .expect(200);

        // The scheduled event should still exist
        const scheduledEvent = await table(db, 'watering_events')
            .where({ id: createdEventIds[0] })
            .first();

        expect(scheduledEvent).toBeDefined();

        // Unscheduled future events should be gone
        if (createdEventIds.length > 1) {
            const deletedEvent = await table(db, 'watering_events')
                .where({
                    id: createdEventIds[createdEventIds.length - 1],
                })
                .first();

            expect(deletedEvent).toBeUndefined();
        }
    });
});