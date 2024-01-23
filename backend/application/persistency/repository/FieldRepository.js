const { QueryTypes } = require('sequelize')
const { WateringAdviceProfileData, WateringAdviceDto } = require('../../dtos/wateringAdviceDto')

class FieldRepository {

  constructor(MatrixProfile, MatrixField, TranscodingField, sequelize) {
    this.MatrixProfile = MatrixProfile
    this.MatrixField = MatrixField
    this.TranscodingField = TranscodingField
    this.sequelize = sequelize
  }

  async createMatrixProfile(matrixId, xx, yy, zz, optValue, weight) {
    const model = this.MatrixProfile.build({matrixId: matrixId, xx: xx, yy: yy, zz: zz, optValue: optValue, weight: weight})
    this.MatrixProfile.removeAttribute('id')
    return await model.save()
  }

  async createMatrixField(matrixId, refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo) {
    this.MatrixField.update(
      { current:false },
      {
        where: {
          refStructureName: refStructureName,
          companyName: companyName,
          fieldName: fieldName,
          plantNum: plantNum,
          plantRow: plantRow
        }
      }
    )
    const model = this.MatrixField.build({matrixId: matrixId, refStructureName: refStructureName, companyName: companyName, fieldName: fieldName, plantNum: plantNum, plantRow: plantRow, timestamp_from: timestampFrom, timestamp_to: timestampTo, current: true})
    this.MatrixField.removeAttribute('id')
    return await model.save()
  }

  async getCurrentWaterAdvice(refStructureName, companyName, fieldName, plantNum, plantRow) {
    const query = `
        SELECT "timestamp_from", "timestamp_to", "xx", "yy", "zz", "optValue", "weight"
        FROM field_matrix fm
        JOIN matrix_profile mp ON fm."matrixId" = mp."matrixId"
        WHERE fm."refStructureName" = '${refStructureName}'
        AND fm."companyName" = '${companyName}'
        AND fm."fieldName" = '${fieldName}'
        AND fm."plantNum" = '${plantNum}'
        AND fm."plantRow" = '${plantRow}'
        AND fm."current" = true`;

    const results = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: {
        refStructureName,
        companyName,
        fieldName,
        plantNum,
        plantRow
      }
    });

    if(results) {
      const timestampFrom = results[0].timestamp_from
      const timestampTo = results[0].timestamp_to
      const profiles = results.map(result => new WateringAdviceProfileData(result.xx, result.yy, result.zz, result.optValue, result.weight))
      return new WateringAdviceDto(timestampFrom, timestampTo, profiles)
    } else return new WateringAdviceDto(0, 0, [])
  }

  async createTranscodingField(source, fieldId, refStructureId, refStructureName, companyId, companyName, fieldName, parcelCode, address, plant, latitude, longitude, sensor) {
    const model = this.TranscodingField.build({
      source: source,
      refStructureId: refStructureId,
      companyId: companyId,
      fieldId: fieldId,
      plantId: plant.plantId,
      nodeId: sensor.nodeId,
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      plantNum: plant.plantNum,
      plantRow: plant.plantRow,
      colture: plant.colture.colture,
      coltureType: plant.colture.coltureType,
      parcelCode: parcelCode,
      address: address,
      refNode: sensor.refNode,
      doProfile: sensor.doProfile,
      xxProfile: sensor.xx,
      yyProfile: sensor.yy,
      zzProfile: sensor.zz,
      sensorsNumber: sensor.sensorNumber,
      plantName: plant.plantName,
      nodeDescription: sensor.nodeDescription,
      latitude: latitude,
      longitude: longitude
    });
    this.TranscodingField.removeAttribute('id')
    return model.save()
  }

}

module.exports = FieldRepository