import { InterpolatedDataResponse, InterpolatedDataValue, InterpolatedMeanMeasureData, InterpolatedMeasureData } from "../dtos/interpolatedDataDto.js";
import { PlantDto } from "../dtos/plantDto.js";
import { ColtureDto } from "../dtos/coltureDto.js";
import { DataResponse, DataValue, MeasureData, HumidityBinMeasureData } from '../dtos/dataDto.js';
import { WateringScheduleResponse, WateringEventDto } from "../dtos/wateringScheduleDto.js";
import { MatrixData, OptStateDto } from "../dtos/optStateDto.js";

class DtoConverter {

    convertDataInterpolatedMeanWrapper(refStructureName, companyName, fieldName, sectorName, plantRow, wrappers) {
        const plant = new PlantDto(sectorName, plantRow);
        const measures = wrappers.map(wrapper => new InterpolatedMeanMeasureData(wrapper.zz, wrapper.yy, wrapper.xx, wrapper.std, wrapper.mean));
        return new InterpolatedDataValue(refStructureName, companyName, fieldName, plant, measures);
    }

    convertDataInterpolatedWrapper(wrappers){
        const map = this.#buildGenericReferenceMap(wrappers);

        const interpolatedValues = Array.from(map, ([key, values]) => {
            const keyObject = JSON.parse(key);
            const plant = new PlantDto(keyObject.sectorName, keyObject.plantRow);
            const measures = Array.from(values.reduce((accumulator, currentValue) => {
                if (!accumulator.has(currentValue.timestamp))
                    accumulator.set(currentValue.timestamp, []);
                accumulator.get(currentValue.timestamp).push(new InterpolatedMeasureData(currentValue.zz, currentValue.yy, currentValue.xx, currentValue.value));
                return accumulator
            }, new Map()), ([key, values]) => { return { timestamp: key, image: values } })
            return new InterpolatedDataValue(keyObject.refStructureName, keyObject.companyName, keyObject.fieldName, plant, measures);
        });

        return new InterpolatedDataResponse(interpolatedValues);
    }

    convertHumidityBinEventWrapper(wrappers) {
        return this.#convertGenericReferenceData(wrappers);
    }

    convertHumidityBinWrapper(wrappers) {
        const map = this.#buildGenericReferenceMap(wrappers);

        const dataValues = Array.from(map, ([key, values]) => {
            const keyObject = JSON.parse(key);
            const plant = new PlantDto(keyObject.sectorName, keyObject.plantRow);
            const measures = values.map(value => new HumidityBinMeasureData(value.humidity_bin, value.timestamp, value.count));
            return new DataValue(keyObject.refStructureName, keyObject.companyName, keyObject.fieldName, plant, measures);
        });

        return new DataResponse(dataValues);
    }

    convertWateringAdviceWrapper(wrappers){
        return this.#convertGenericReferenceData(wrappers);
    }

    convertViewDataOriginalWrapper(wrappers) {
        const map = wrappers.reduce((accumulator, currentValue) => {
            const key = {
                refStructureName: currentValue.refStructureName,
                companyName: currentValue.companyName,
                fieldName: currentValue.fieldName,
                sectorName: currentValue.sectorName,
                plantRow: currentValue.plantRow,
                colture: currentValue.colture,
                coltureType: currentValue.coltureType
            };
            if(accumulator.has(JSON.stringify(key)))
                accumulator.get(JSON.stringify(key)).push(currentValue);
            else {
                accumulator.set(JSON.stringify(key), []);
                accumulator.get(JSON.stringify(key)).push(currentValue);
            }
            return accumulator;
        }, new Map());

        const dataValues = Array.from(map, ([key, values]) => {
            const keyObject = JSON.parse(key);
            const colture = new ColtureDto(keyObject.colture, keyObject.coltureType);
            const plant = new PlantDto(keyObject.sectorName, keyObject.plantRow, colture);
            const measures = values.map(value => new MeasureData(value.detectedValueTypeDescription, value.timestamp, value.value));
            return new DataValue(keyObject.refStructureName, keyObject.companyName, keyObject.fieldName, plant, measures);
        });

        return new DataResponse(dataValues);
    }

    convertDeltaWrapper(wrappers) {
        return this.#convertGenericReferenceData(wrappers);
    }

    convertWateringScheduleWrapper(wrappers) {
        const schedules = wrappers.reduce((accumulator, currentValue) => {
            const key = {
                refStructureName: currentValue.refStructureName,
                companyName: currentValue.companyName,
                fieldName: currentValue.fieldName,
                sectorName: currentValue.sectorName
            };
            if (!accumulator.has(JSON.stringify(key)))
                accumulator.set(JSON.stringify(key), []);
            accumulator.get(JSON.stringify(key)).push(currentValue);
            return accumulator;
        }, new Map())

        if (schedules.size > 0) {
            const [key, events] = schedules.entries().next().value
            const { refStructureName, companyName, fieldName, sectorName } = JSON.parse(key);
            const eventsRes = events.map(event => new WateringEventDto(
                event.plantRow,
                event.date,
                event.wateringStart,
                event.wateringEnd,
                event.duration,
                event.enabled,
                event.expectedWater,
                event.advice,
                event.adviceTimestamp,
                event.user !== null ? event.user.dataValues.updatedBy : null,
                event.updateTimestamp,
                event.note
            ));
            return new WateringScheduleResponse(refStructureName, companyName, fieldName, sectorName, eventsRes)
        }
    }

    convertOptimalStateWrapper(wrappers){
        const [[jsonKey, values]] = this.#buildGenericReferenceMap(wrappers).entries();
        const key = JSON.parse(jsonKey)
        const exampleData = values[0]
        const optimalState = values.map(v => new MatrixData(v.xx, v.yy, v.zz, v.optValue, v.weight))

        return new OptStateDto(key.refStructureName, key.companyName, key.fieldName, key.sectorName, key.plantRow, 
            exampleData.validFrom, exampleData.validTo, optimalState)
    }

    convertPunctualDistanceWrapper(wrappers){
        const [[jsonKey, values]] = this.#buildGenericReferenceMap(wrappers).entries();
        const key = JSON.parse(jsonKey)
        const distances = values.map(v => new InterpolatedMeasureData(0, v.yy, v.xx, v.distance))
        return new InterpolatedDataValue(key.refStructureName, key.companyName, key.fieldName, new PlantDto(key.sectorName, key.plantRow), distances)
    }

    #buildGenericReferenceMap(wrappers) {
        return wrappers.reduce((accumulator, currentValue) => {
            const key = {
                refStructureName: currentValue.refStructureName,
                companyName: currentValue.companyName,
                fieldName: currentValue.fieldName,
                sectorName: currentValue.sectorName,
                plantRow: currentValue.plantRow
            };
            if(accumulator.has(JSON.stringify(key)))
                accumulator.get(JSON.stringify(key)).push(currentValue);
            else {
                accumulator.set(JSON.stringify(key), []);
                accumulator.get(JSON.stringify(key)).push(currentValue);
            }
            return accumulator;
        }, new Map());
    }

    #convertGenericReferenceData(wrappers) {
        const map = this.#buildGenericReferenceMap(wrappers);

        const dataValues = Array.from(map, ([key, values]) => {
            const keyObject = JSON.parse(key);
            const plant = new PlantDto(keyObject.sectorName, keyObject.plantRow);
            const measures = values.map(value => new MeasureData(value.detectedValueTypeDescription, value.timestamp, value.value));
            return new DataValue(keyObject.refStructureName, keyObject.companyName, keyObject.fieldName, plant, measures);
        });

        return new DataResponse(dataValues);
    }

}

export default DtoConverter;