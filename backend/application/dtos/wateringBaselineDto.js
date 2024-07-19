class WateringBaseline {

    /**
     * @param {string} refStructureName - Reference structure name
     * @param {string} companyName - Company name
     * @param {string} fieldName - Field name
     * @param {string} sectorName - Sector name
     * @param {number} maxIrrigation - Maximum irrigation amount
     * @param {number} irrigationBaseline - Baseline irrigation amount
     * @param {number} wateringCapacity - Watering capacity
     * @param {string} valveId - Identifier for the valve
     * @param {string} irrigationMasterThesis - Thesis related to irrigation
     * @param {string} wateringHour - Time for watering
     * @param {number} sprinklerCapacity - Capacity of the sprinkler
     */
    constructor({
        refStructureName,
        companyName,
        fieldName,
        sectorName,
        maxIrrigation,
        irrigationBaseline,
        wateringCapacity,
        valveId,
        irrigationMasterThesis,
        wateringHour,
        sprinklerCapacity
    }) {
        this.refStructureName = refStructureName;
        this.companyName = companyName;
        this.fieldName = fieldName;
        this.sectorName = sectorName;
        this.maxIrrigation = maxIrrigation;
        this.irrigationBaseline = irrigationBaseline;
        this.wateringCapacity = wateringCapacity;
        this.valveId = valveId;
        this.irrigationMasterThesis = irrigationMasterThesis;
        this.wateringHour = wateringHour;
        this.sprinklerCapacity = sprinklerCapacity;
    }

}

export default WateringBaseline;
