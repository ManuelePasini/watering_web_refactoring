import { TABLES } from "../commons/constants.js";
import { WateringAdvice } from "../dtos/wateringAdviceDto.js";
import { WateringParams } from "../dtos/wateringParamsDto.js";
import InterpolatedProfileRepository from "../persistency/repository/InterpolatedProfileRepository.js";
import OptimalDistanceRepository from "../persistency/repository/OptimalDistanceRepository.js";
import SectorRepository from "../persistency/repository/SectorRepository.js";
import ThesesAllSignalsRepository from "../persistency/repository/ThesesAllSignalsRepository.js";
import ThesisRepository from "../persistency/repository/ThesisRepository.js";
import WateringAdviceRepository from "../persistency/repository/WateringAdviceRepository.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";

const dtoConverter = new DtoConverter();

interface SectorDetails {
    id: number;
    dripperCapacity?: number | null;
    sprinklerCapacity?: number | null;
}

const applyWateringRules = (
    advice: number,
    maxWatering: number
): number => {
    // RULE 1: minimum watering = 0
    if (advice < 0) {
        advice = 0;
    }

    // RULE 2: maximum watering
    if (advice > maxWatering) {
        advice = maxWatering;
    }

    return advice;
};

const computeIrrigation = (
    advice: number,
    sectorDetails: SectorDetails,
    maxWatering: number,
    expectedWater: number
): { advice: number; duration: number } => {
    advice = applyWateringRules(advice, maxWatering);

    const irrigationQuantity = Math.max(
        0,
        advice - expectedWater
    );

    const wateringCapacity =
        sectorDetails.dripperCapacity ??
        sectorDetails.sprinklerCapacity;

    if (!wateringCapacity || wateringCapacity <= 0) {
        throw new Error(
            "No valid watering capacity found for sector"
        );
    }

    const duration = Math.ceil(
        (irrigationQuantity / wateringCapacity) * 60
    );

    return {
        advice,
        duration,
    };
};

export class WateringAdviceService {
    constructor(
        private readonly wateringAdviceRepository: WateringAdviceRepository,
        private readonly sectorRepository: SectorRepository,
        private readonly thesisRepository: ThesisRepository,
        private readonly interpolatedProfileRepository: InterpolatedProfileRepository,
        private readonly optimalDistanceRepository: OptimalDistanceRepository,
        private readonly thesesAllSignalsRepository: ThesesAllSignalsRepository,
        private readonly userActionService: UserActionService
    ) { }

    async getThesisLastWateringAdvice(
        thesisId: number,
        timestamp: number
    ) {
        const result =
            await this.wateringAdviceRepository
                .getThesisLastWateringAdvice(
                    thesisId,
                    timestamp
                );

        if (result) {
            return dtoConverter.convertWateringAdviceWrapper(
                result
            );
        }

        return undefined;
    }

    async getWateringAdvice(
        thesisId: number,
        expectedWater: number,
        timestamp: number
    ) {
        try {
            let r: number | undefined;
            let wetFlag = false;

            const thesisDetails =
                await this.thesisRepository.getThesisDetails(
                    thesisId,
                    timestamp,
                    timestamp
                );

            const algorithmParams =
                await this.wateringAdviceRepository
                    .getWateringAlgorithmParams(
                        thesisId,
                        timestamp
                    );

            if (!thesisDetails || !algorithmParams) {
                throw new Error(
                    "Thesis details or algorithm params not found"
                );
            }

            const sectorDetails =
                await this.sectorRepository.getSectorDetails(
                    thesisDetails.sector.id,
                    timestamp,
                    timestamp
                );

            if (!sectorDetails) {
                throw new Error(
                    "Sector details not found"
                );
            }

            const lastImageTimestamp =
                await this.interpolatedProfileRepository
                    .findLastInterpolationTimestamp(
                        thesisId,
                        timestamp -
                        algorithmParams.wateringFrequency *
                        3600,
                        timestamp
                    );

            if (lastImageTimestamp) {
                const optimalDistance =
                    await this.optimalDistanceRepository
                        .findThesisOptimalDistance(
                            thesisId,
                            lastImageTimestamp,
                            lastImageTimestamp
                        );

                const stopThreshold =
                    optimalDistance.find(
                        (distance) =>
                            distance.valueType ===
                            "Stop irrigazione"
                    )?.value;

                const actualMoisture =
                    optimalDistance.find(
                        (distance) =>
                            distance.valueType ===
                            "Media giornaliera"
                    )?.value;

                const optimalMoisture =
                    optimalDistance.find(
                        (distance) =>
                            distance.valueType ===
                            "Media ottimale"
                    )?.value;

                if (
                    actualMoisture != null &&
                    optimalMoisture != null
                ) {
                    wetFlag =
                        stopThreshold != null &&
                        actualMoisture > stopThreshold;

                    r =
                        actualMoisture -
                        optimalMoisture;

                    const oldParams =
                        await this.wateringAdviceRepository
                            .getThesisLastWateringAdvice(
                                thesisId,
                                Math.min(
                                    timestamp -
                                    (algorithmParams.wateringFrequency /
                                        2) *
                                    3600,
                                    lastImageTimestamp
                                )
                            );

                    if (
                        oldParams?.advice != null &&
                        oldParams.r != null &&
                        oldParams.imageTimestamp != null &&
                        oldParams.wateringStart >
                        timestamp -
                        30 * 12 * 3600
                    ) {
                        const advicePID =
                            oldParams.advice -
                            algorithmParams.kp *
                            (r - oldParams.r) -
                            algorithmParams.ki * r;

                        const { advice, duration } =
                            computeIrrigation(
                                wetFlag
                                    ? 0
                                    : advicePID,
                                sectorDetails,
                                algorithmParams.maxWatering,
                                expectedWater
                            );

                        const measurements =
                            await this.thesesAllSignalsRepository
                                .getMeasurementsByThesis(
                                    thesisId,
                                    ["DRIPPER"],
                                    oldParams.imageTimestamp,
                                    lastImageTimestamp,
                                    "SUM",
                                    (lastImageTimestamp -
                                        oldParams.imageTimestamp +
                                        2) *
                                    2
                                );

                        const lastWatering =
                            measurements[0]?.value ?? 0;

                        return new WateringAdvice(
                            thesisDetails.thesisName,
                            advice,
                            duration,
                            Number(lastImageTimestamp),
                            Number(timestamp),
                            r,
                            lastWatering,
                            false
                        );
                    }

                    console.warn(
                        "No old params found, using baseline"
                    );
                } else {
                    console.warn(
                        "No optimal image found, using baseline"
                    );
                }
            } else {
                console.warn(
                    "No observed profile found during last irrigation period, using baseline"
                );
            }

            const { advice, duration } =
                computeIrrigation(
                    wetFlag
                        ? 0
                        : algorithmParams.wateringBaseline,
                    sectorDetails,
                    algorithmParams.maxWatering,
                    expectedWater
                );

            return new WateringAdvice(
                thesisDetails.thesisName,
                advice,
                duration,
                Number(lastImageTimestamp),
                Number(timestamp),
                r,
                undefined,
                true
            );
        } catch (error) {
            console.error(
                "Error in getWateringAdvice:",
                error
            );

            throw new Error(
                "Failed to compute watering advice",
                { cause: error }
            );
        }
    }

    async setWateringAlgorithmParams(
        userId: number,
        thesisId: number,
        wateringParams: WateringParams,
        validFrom: number,
        validTo: number
    ): Promise<void> {
        const algorithmId =
            await this.wateringAdviceRepository
                .setWateringAlgorithmParams(
                    thesisId,
                    wateringParams,
                    validFrom,
                    validTo
                );

        if (algorithmId) {
            await this.userActionService.logCreation(
                userId,
                TABLES.WATERING_ALGORITHM,
                algorithmId,
                null
            );
        }
    }

    async getWateringAlgorithmParams(
        thesisId: number,
        timestamp: number
    ) {
        const result =
            await this.wateringAdviceRepository
                .getWateringAlgorithmParams(
                    thesisId,
                    timestamp
                );

        if (result) {
            return dtoConverter
                .convertWateringAlgorithmParamsWrapper(
                    result
                );
        }

        return undefined;
    }
}

export default WateringAdviceService;