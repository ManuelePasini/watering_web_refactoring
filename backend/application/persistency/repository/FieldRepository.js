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
    const model = this.MatrixProfile.build({matrixId: matrixId, xx: x, yy: y, zz: z, optValue: value})
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
            sectorName: sectorname,
            thesis: thesis
          }
        }
      )
      const model = this.MatrixField.build({
        refStructureName: structureName,
        companyName: companyName,
        fieldName: fieldName,
        sectorName: sectorname,
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

  async getCurrentWaterAdvice(refStructureName, companyName, fieldName, sectorName, thesis) {
    const query = `
        SELECT "timestamp_from", "timestamp_to", "xx", "yy", "zz", "optValue"
        FROM field_matrix fm
        JOIN matrix_profile mp ON fm."matrixId" = mp."matrixId"
        WHERE fm."refStructureName" = '${refStructureName}'
        AND fm."companyName" = '${companyName}'
        AND fm."fieldName" = '${fieldName}'
        AND fm."sectorName" = '${sectorName}'
        AND fm."thesis" = '${thesis}'
        AND fm."current" = true`;

    const results = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: {
        refStructureName,
        companyName,
        fieldName,
        sectorName,
        thesis
      }
    });

    if(results) {
      const timestampFrom = results[0].timestamp_from
      const timestampTo = results[0].timestamp_to
      const profiles = results.map(result => new WateringAdviceProfileData(result.xx, result.yy, result.zz, result.optValue))
      return new WateringAdviceDto(timestampFrom, timestampTo, profiles)
    } else return new WateringAdviceDto(0, 0, [])
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