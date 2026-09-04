import { Op, QueryTypes, Sequelize } from 'sequelize';
import { getErrorMessage } from '../../commons/utils.js';
import { _deleteFromModelByParams } from '../../commons/repositoryUtils.js';
import { AdviceModel } from '../model/AdviceModel.js';
import { ThesisModel } from '../model/ThesisModel.js';
import { WateringAlgorithmParamsModel } from '../model/WateringAlgorithmParamsModel.js';

interface WateringAdviceModels {
    Advice: typeof AdviceModel;
    Thesis: typeof ThesisModel;
    WateringAlgorithmParams: typeof WateringAlgorithmParamsModel;
}

interface WateringAlgorithmParams {
    maxWatering?: number;
    minWatering?: number;
    wateringBaseline?: number;
    wateringFrequency?: number;
    ki?: number;
    kp?: number;
    errorFunction?: string;
    description?: string;
}

interface SectorWateringFrequency {
    wateringFrequency: number;
    validFrom: number;
    validTo: number | null;
}

class WateringAdviceRepository {
    private readonly Advice: typeof AdviceModel;
    private readonly Thesis: typeof ThesisModel;
    private readonly WateringAlgorithmParams: typeof WateringAlgorithmParamsModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: WateringAdviceModels,
        sequelize: Sequelize,
    ) {
        this.Advice = models.Advice;
        this.Thesis = models.Thesis;
        this.WateringAlgorithmParams = models.WateringAlgorithmParams;
        this.sequelize = sequelize;
    }

    async getThesisLastWateringAdvice(
        thesisId: number,
        timestamp: number,
    ): Promise<AdviceModel & { thesisName: string }> {
        return await this.Advice.findOne({
            where: {
                thesisId,
                wateringStart: {
                    [Op.lt]: timestamp,
                },
            },
            include: [{
                model: this.Thesis,
                as: 'thesis',
                attributes: [],
            }],
            attributes: {
                include: [
                    [Sequelize.col('thesis.thesis_name'), 'thesisName'],
                ],
            },
            raw: true,
            order: [['wateringStart', 'DESC']],
        }) as AdviceModel & { thesisName: string };
    }

    async getWateringAlgorithmParams(
        thesisId: number,
        timestamp: number,
    ): Promise<WateringAlgorithmParamsModel | null> {
        return await this.WateringAlgorithmParams.findOne({
            where: {
                thesisId,
                validFrom: {
                    [Op.lt]: timestamp,
                },
                validTo: {
                    [Op.or]: {
                        [Op.is]: null,
                        [Op.gt]: timestamp,
                    },
                },
            },
            raw: true,
        });
    }

    async getSectorWateringFrequency(
        sectorId: number,
        timefilterFrom: number,
        timefilterTo: number,
    ): Promise<SectorWateringFrequency[]> {
        const query = `
            SELECT DISTINCT 
                wad.watering_frequency AS "wateringFrequency",
                wad.valid_from AS "validFrom",
                wad.valid_to AS "validTo"
            FROM watering_algorithm_params wad
            JOIN theses_in_sectors tis ON tis.thesis_id = wad.thesis_id
            WHERE tis.sector_id = :sectorId
                AND tis.valid_from < :timefilterTo
                AND (tis.valid_to IS NULL OR tis.valid_to > :timefilterFrom)
            ORDER BY wad.valid_from ASC
        `;

        return await this.sequelize.query<SectorWateringFrequency>(query, {
            type: QueryTypes.SELECT,
            replacements: {
                sectorId,
                timefilterFrom,
                timefilterTo,
            },
        });
    }

    async setWateringAlgorithmParams(
        thesisId: number,
        wateringParams: WateringAlgorithmParams,
        validFrom: number,
        validTo: number | null,
    ): Promise<number> {
        try {
            const oldParams = await this.getWateringAlgorithmParams(
                thesisId,
                validFrom,
            );

            await this.WateringAlgorithmParams.update(
                {
                    validTo: validFrom,
                },
                {
                    where: {
                        thesisId,
                        validFrom: {
                            [Op.lt]: validFrom,
                        },
                        validTo: {
                            [Op.or]: {
                                [Op.is]: null,
                                [Op.gt]: validFrom,
                            },
                        },
                    },
                },
            );

            const model = await this.WateringAlgorithmParams.create({
                thesisId,
                validFrom,
                validTo,
                maxWatering:
                    wateringParams.maxWatering ?? oldParams?.maxWatering,
                minWatering:
                    wateringParams.minWatering ?? oldParams?.minWatering,
                wateringBaseline:
                    wateringParams.wateringBaseline ?? oldParams?.wateringBaseline,
                wateringFrequency:
                    wateringParams.wateringFrequency ?? oldParams?.wateringFrequency,
                ki: wateringParams.ki ?? oldParams?.ki,
                kp: wateringParams.kp ?? oldParams?.kp,
                errorFunction:
                    wateringParams.errorFunction ?? oldParams?.errorFunction,
                description: wateringParams.description,
            });

            return model.id;
        } catch (error) {
            throw new Error(
                `Error setting watering algorithm parameters: ${getErrorMessage(error)}`,
            );
        }
    }

    async setWateringAlgorithmParamsEndDate(
        thesisId: number,
        timestamp: number,
    ): Promise<number | undefined> {
        try {
            const [, updatedRecords] =
                await this.WateringAlgorithmParams.update(
                    {
                        validTo: timestamp,
                    },
                    {
                        where: {
                            thesisId,
                            validFrom: {
                                [Op.lt]: timestamp,
                            },
                            validTo: {
                                [Op.or]: [
                                    { [Op.is]: null },
                                    { [Op.gt]: timestamp },
                                ],
                            },
                        },
                        returning: true,
                    },
                );

            if (updatedRecords.length > 0) {
                return updatedRecords[0].id;
            }

            return undefined;
        } catch (error) {
            throw new Error(
                `Error ending watering algorithm params validity: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteWateringAlgorithmParams(
        thesisId: number,
    ): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.WateringAlgorithmParams,
                { thesisId },
            );
        } catch (error) {
            throw new Error(
                `Error deleting watering algorithm parameters: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteWateringAdvices(
        thesisId: number,
    ): Promise<void> {
        try {
            await this.Advice.destroy({
                where: {
                    thesisId,
                },
            });
        } catch (error) {
            throw new Error(
                `Error deleting advices for thesis: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default WateringAdviceRepository;