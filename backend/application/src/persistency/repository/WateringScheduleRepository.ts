import { Op, QueryTypes, Sequelize } from 'sequelize';
import { getErrorMessage, removeUndefined } from '../../commons/utils.js';
import { WateringEventModel } from '../model/WateringEventModel.js';
import { WateringEvent } from '../../dtos/wateringScheduleDto.js';

export interface WateringScheduleRow {
    sectorId: number;
    date: string | null;
    wateringStart: number;
    wateringEnd: number | null;
    advice: string | null;
    duration: number | null;
    enabled: boolean;
    scheduled: boolean;
    expectedWater: number | null;
    eventId: number;
    note: string | null;
    updateTimestamp: number | null;
    updatedBy: string | null;
    thesisId: number;
    thesisName: string;
    sectorName: string;
    weight: number;
    imageTimestamp: number | null;
}

interface FollowingWateringEvent {
    id: number;
    sectorId: number;
    date: string | null;
    wateringStart: number;
    wateringEnd: number | null;
    advice: string | null;
    duration: number | null;
    expectedWater: number | null;
    note: string | null;
    enabled: boolean;
    scheduled: boolean;
}

interface CreateWateringEventParams {
    sectorId: number;
    wateringStart: number | null;
    expectedWater?: number | null;
    note?: string | null;
    enabled?: boolean;
    scheduled?: boolean;
}

class WateringScheduleRepository {
    private readonly WateringEvent: typeof WateringEventModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            WateringEvent: typeof WateringEventModel
        },
        sequelize: Sequelize,
    ) {
        this.WateringEvent = models.WateringEvent;
        this.sequelize = sequelize;
    }

    async getSectorSchedules(
        sectorId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<WateringScheduleRow[]> {
        try {
            const query = `
                SELECT
                    we.sector_id as "sectorId",
                    we.date as "date",
                    we.watering_start as "wateringStart",
                    we.watering_end as "wateringEnd",
                    we.advice as "advice",
                    we.duration as "duration",
                    we.enabled as "enabled",
                    we.scheduled as "scheduled",
                    we.expected_water as "expectedWater",
                    we.id as "eventId",
                    we.note as "note",
                    ua.timestamp as "updateTimestamp",
                    u.email as "updatedBy",
                    tis.thesis_id as "thesisId",
                    t.thesis_name as "thesisName",
                    s.sector_name as "sectorName",
                    tis.weight as "weight",
                    a.image_timestamp as "imageTimestamp"
                FROM public.watering_events we
                LEFT JOIN LATERAL (
                    SELECT *
                    FROM public.users_actions
                    WHERE "table" = 'watering_events'
                        AND action = 'UPDATE'
                        AND id_key = we.id
                    ORDER BY timestamp DESC
                    LIMIT 1
                ) ua ON true
                LEFT JOIN users u
                    ON ua.user_id = u.id
                JOIN theses_in_sectors tis
                    ON tis.sector_id = we.sector_id
                    AND tis.valid_from <= we.watering_start
                    AND (tis.valid_to IS NULL OR tis.valid_to >= we.watering_start)
                    AND tis.valid_from <= :timeFilterTo
                    AND (tis.valid_to IS NULL OR tis.valid_to >= :timeFilterFrom)
                LEFT JOIN advices a
                    ON tis.thesis_id = a.thesis_id
                    AND we.watering_start = a.watering_start
                JOIN theses t
                    ON t.id = tis.thesis_id
                JOIN sectors s
                    ON s.id = tis.sector_id
                WHERE we.sector_id = :sectorId
                    AND we.watering_start BETWEEN :timeFilterFrom AND :timeFilterTo
                    AND tis.weight IS NOT NULL
            `;

            return await this.sequelize.query<WateringScheduleRow>(
                query,
                {
                    replacements: {
                        sectorId,
                        timeFilterFrom,
                        timeFilterTo,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } catch (error) {
            throw new Error(
                `Error while retrieving watering events caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getUserWateringEvents(
        filteringSectorIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        userId: number,
    ): Promise<WateringScheduleRow[]> {
        try {
            const query = `
                SELECT DISTINCT
                    we.sector_id as "sectorId",
                    we.date as "date",
                    we.watering_start as "wateringStart",
                    we.watering_end as "wateringEnd",
                    we.advice as "advice",
                    we.duration as "duration",
                    we.enabled as "enabled",
                    we.scheduled as "scheduled",
                    we.expected_water as "expectedWater",
                    we.id as "eventId",
                    we.note as "note",
                    ua.timestamp as "updateTimestamp",
                    u.email as "updatedBy",
                    tis.thesis_id as "thesisId",
                    t.thesis_name as "thesisName",
                    s.sector_name as "sectorName",
                    tis.weight as "weight",
                    a.image_timestamp as "imageTimestamp"
                FROM public.watering_events we
                LEFT JOIN LATERAL (
                    SELECT *
                    FROM public.users_actions
                    WHERE "table" = 'watering_events'
                        AND action = 'UPDATE'
                        AND id_key = we.id
                    ORDER BY timestamp DESC
                    LIMIT 1
                ) ua ON true
                LEFT JOIN users u
                    ON ua.user_id = u.id
                JOIN theses_in_sectors tis
                    ON tis.sector_id = we.sector_id
                    AND tis.valid_from <= we.watering_start
                    AND (tis.valid_to IS NULL OR tis.valid_to >= we.watering_start)
                    AND tis.valid_from <= :timeFilterTo
                    AND (tis.valid_to IS NULL OR tis.valid_to >= :timeFilterFrom)
                LEFT JOIN advices a
                    ON tis.thesis_id = a.thesis_id
                    AND we.watering_start = a.watering_start
                JOIN theses t
                    ON t.id = tis.thesis_id
                JOIN sectors s
                    ON s.id = tis.sector_id
                JOIN users usr
                    ON usr.id = :userId
                WHERE we.watering_start BETWEEN :timeFilterFrom AND :timeFilterTo
                    AND ${
                        filteringSectorIds === null
                            ? 'TRUE'
                            : filteringSectorIds.length === 0
                                ? 'FALSE'
                                : 's.id = ANY(ARRAY[:filteringSectorIds])'
                    }
            `;

            return await this.sequelize.query<WateringScheduleRow>(
                query,
                {
                    replacements: {
                        filteringSectorIds,
                        timeFilterFrom,
                        timeFilterTo,
                        userId,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } catch (error) {
            throw new Error(
                `Error while retrieving watering events caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async updateWateringEvent(
        eventId: number,
        fieldsToUpdate: Partial<WateringEvent>,
    ): Promise<WateringEventModel | null> {
        let date
        if (
            Object.prototype.hasOwnProperty.call(
                fieldsToUpdate,
                'wateringStart',
            ) &&
            fieldsToUpdate.wateringStart !== null &&
            fieldsToUpdate.wateringStart !== undefined
        ) {
            const dateObj = new Date(
                fieldsToUpdate.wateringStart * 1000,
            );

            date = `${dateObj.getFullYear()}-${String(
                dateObj.getMonth() + 1,
            ).padStart(2, '0')}-${String(
                dateObj.getDate(),
            ).padStart(2, '0')}`;
        }

        try {
            const event = await this.WateringEvent.findByPk(eventId);

            if (!event) {
                return null;
            }

            return await event.update(removeUndefined({date, ...fieldsToUpdate}));
        } catch (error) {
            throw new Error(
                `Error while updating watering event caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async findEvent(
        eventId: number,
    ): Promise<WateringEventModel | null> {
        try {
            return await this.WateringEvent.findByPk(eventId, {
                raw: true,
            });
        } catch (error) {
            throw new Error(
                `Error while searching following caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async findFollowingEvent(
        eventId: number,
    ): Promise<FollowingWateringEvent | null> {
        const query = `
            WITH reference_event AS (
                SELECT sector_id, watering_start
                FROM watering_events
                WHERE id = :eventId
            )
            SELECT
                w.id,
                w.sector_id as "sectorId",
                w.date,
                w.watering_start as "wateringStart",
                w.watering_end as "wateringEnd",
                w.advice,
                w.duration,
                w.expected_water as "expectedWater",
                w.note,
                w.enabled,
                w.scheduled
            FROM watering_events w
            JOIN reference_event r
                ON w.sector_id = r.sector_id
            WHERE w.watering_start > r.watering_start
            ORDER BY w.watering_start ASC
            LIMIT 1;
        `;

        try {
            return await this.sequelize.query<FollowingWateringEvent>(
                query,
                {
                    replacements: {
                        eventId,
                    },
                    type: QueryTypes.SELECT,
                    plain: true,
                },
            );
        } catch (error) {
            throw new Error(
                `Error while searching following event caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async createWateringEvent({
        sectorId,
        wateringStart,
        expectedWater = null,
        note = null,
        enabled = true,
        scheduled = false,
    }: CreateWateringEventParams): Promise<number> {
        try {
            let date: string | null = null;

            if (
                wateringStart !== null &&
                wateringStart !== undefined
            ) {
                const dateObj = new Date(wateringStart * 1000);

                date = `${dateObj.getFullYear()}-${String(
                    dateObj.getMonth() + 1,
                ).padStart(2, '0')}-${String(
                    dateObj.getDate(),
                ).padStart(2, '0')}`;
            }

            const newEvent = await this.WateringEvent.create({
                sectorId,
                wateringStart,
                expectedWater,
                note,
                enabled,
                scheduled,
                date,
            });

            return newEvent.id;
        } catch (error) {
            throw new Error(
                `Error while creating watering event caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteWateringEvents(
        sectorId: number,
        timestamp: number,
    ): Promise<number[]> {
        try {
            const events = await this.WateringEvent.findAll({
                attributes: ['id'],
                where: {
                    sectorId,
                    wateringStart: {
                        [Op.gt]: timestamp,
                    },
                },
            });

            if (events.length === 0) {
                return [];
            }

            const idsToDelete = events.map((event) => event.id);

            await this.WateringEvent.destroy({
                where: {
                    id: idsToDelete,
                },
            });

            return idsToDelete;
        } catch (error) {
            throw new Error(
                `Deletion failed: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default WateringScheduleRepository;