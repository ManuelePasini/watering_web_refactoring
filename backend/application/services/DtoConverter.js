const {InterpolatedDataResponse, InterpolatedDataValue, InterpolatedMeanMeasureData, InterpolatedMeasureData} = require("../dtos/interpolatedDataDto");
const PlantDto = require("../dtos/plantDto");
const ColtureDto = require("../dtos/coltureDto");
const {DataResponse, DataValue, MeasureData, HumidityBinMeasureData} = require('../dtos/dataDto');
const {values} = require("pg/lib/native/query");
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
            const measures = values.map(value => new InterpolatedMeasureData(value.zz, value.yy, value.xx, value.timestamp, value.value));
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
            const measures = values.map(value => new HumidityBinMeasureData(value.umidity_bin, value.timestamp, value.count));
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

module.exports = DtoConverter;