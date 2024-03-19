const { QueryTypes, DataTypes } = require('sequelize')
const { WateringAdviceProfileData, WateringAdviceDto } = require('../../dtos/wateringAdviceDto')

class FieldRepository {

  constructor(MatrixProfile, MatrixField, TranscodingField, sequelize) {
    this.MatrixProfile = MatrixProfile
    this.MatrixField = MatrixField
    this.TranscodingField = TranscodingField
    this.sequelize = sequelize
  }

  async createMatrixProfile(matrixId, x, y, z, value) {
    const model = this.MatrixProfile.build({matrixId: matrixId, xx: x, yy: y, zz: z, optValue: value, weight: 1})
    this.MatrixProfile.removeAttribute('id')
    return await model.save()
  }

  async createMatrixField(structureName, companyName, fieldName, sectorname, thesis, validFrom, validTo) {
    try {
      this.MatrixField.update(
        { current: false },
        {
          where: {
            refStructureName: structureName,
            companyName: companyName,
            fieldName: fieldName,
            sectorname: sectorname,
            thesis: thesis
          }
        }
      )
      const model = this.MatrixField.build({
        refStructureName: structureName,
        companyName: companyName,
        fieldName: fieldName,
        sectorname: sectorname,
        thesis: thesis,
        timestamp_from: Math.floor(new Date(validFrom).getTime() / 1000),
        timestamp_to: Math.floor(new Date(validTo).getTime() / 1000),
        current: true
      })

      const newModel = await model.save()
      return newModel;
    } catch (error) {
      throw Error(error.message)
    }
  }

  async getCurrentWaterAdvice(refStructureName, companyName, fieldName, sectorname, thesis) {

    const query = `
            SELECT t1.advice, timestamp, "wateringHour"
        FROM 
            watering_advice t1
        INNER JOIN (
            SELECT
                "refStructureName",
                "companyName",
                "fieldName",
                sectorname,
                thesis,
                MAX(timestamp) as max_timestamp
            FROM
                watering_advice
            WHERE
                "refStructureName" = '${refStructureName}' AND
                "companyName" = '${companyName}' AND
                "fieldName" = '${fieldName}' AND
                sectorname = '${sectorname}' AND
                thesis = '${thesis}'
            GROUP BY
                "refStructureName",
                "companyName",
                "fieldName",
                sectorname, 
                thesis
        ) t2 ON t1."refStructureName" = t2."refStructureName"
            AND t1."companyName" = t2."companyName"
            AND t1."fieldName" = t2."fieldName"
            AND t1.sectorname = t2.sectorname
            AND t1.thesis = t2.thesis
            AND t1.timestamp = t2.max_timestamp`

    const result = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: {
        refStructureName,
        companyName,
        fieldName,
        sectorname,
        thesis
      }
    });

    if(result && result.length === 1) {
      return new WateringAdviceDto(result[0].advice, new Date(result[0].timestamp * 1000).toISOString(), new Date(result[0].wateringHour * 1000).toISOString())
    } else return new WateringAdviceDto(-1, -1, -1)
  }

  async createTranscodingField(source, refStructureName, companyName, fieldName, coltureType, sectorname, wateringcapacity, initialwatering, maximumwatering, advicetime, wateringtype, adviceweight, thesisname, sensorNumber, sensorid, sensorname, sensortype, x, y, z) {
    const model = this.TranscodingField.build({
      source: source,
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      coltureType: coltureType,
      sectorname: sectorname,
      wateringcapacity: wateringcapacity,
      initialwatering: initialwatering,
      maximumwatering: maximumwatering,
      advicetime: advicetime,
      wateringtype: wateringtype,
      adviceweight: adviceweight,
      thesisname: thesisname,
      sensorNumber: sensorNumber,
      sensorid: sensorid,
      sensorname: sensorname,
      sensortype: sensortype,
      x: x,
      y: y,
      z: z
    });
    this.TranscodingField.removeAttribute('id')
    return model.save()
  }

}

module.exports = FieldRepository