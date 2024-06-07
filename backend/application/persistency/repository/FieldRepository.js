const { QueryTypes, Op } = require('sequelize')
const { WateringAdviceDto } = require('../../dtos/wateringAdviceDto')

class FieldRepository {

  constructor(MatrixProfile, MatrixField, TranscodingField, WateringFields, sequelize) {
    this.MatrixProfile = MatrixProfile
    this.MatrixField = MatrixField
    this.TranscodingField = TranscodingField
    this.WateringFields = WateringFields
    this.sequelize = sequelize
  }

  async createMatrixProfile(matrixId, x, y, z, value) {
    const model = this.MatrixProfile.build({matrixId: matrixId, xx: x, yy: y, zz: z, optValue: value, weight: 1})
    this.MatrixProfile.removeAttribute('id')
    return await model.save()
  }

  async createMatrixField(structureName, companyName, fieldName, sectorName, plantRow, validFrom, validTo) {
    try {
      this.MatrixField.update(
        { current: false },
        {
          where: {
            refStructureName: structureName,
            companyName: companyName,
            fieldName: fieldName,
            sectorName: sectorName,
            plantRow: plantRow
          }
        }
      )
      const model = this.MatrixField.build({
        refStructureName: structureName,
        companyName: companyName,
        fieldName: fieldName,
        sectorName: sectorName,
        plantRow: plantRow,
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

  async getCurrentWaterAdvice(refStructureName, companyName, fieldName, sectorName, plantRow) {

    const query = `
            SELECT t1.advice, timestamp, "wateringHour"
        FROM 
            watering_advice t1
        INNER JOIN (
            SELECT
                "refStructureName",
                "companyName",
                "fieldName",
                sectorName,
                plantRow,
                MAX(timestamp) as max_timestamp
            FROM
                watering_advice
            WHERE
                "refStructureName" = '${refStructureName}' AND
                "companyName" = '${companyName}' AND
                "fieldName" = '${fieldName}' AND
                sectorName = '${sectorName}' AND
                plantRow = '${plantRow}'
            GROUP BY
                "refStructureName",
                "companyName",
                "fieldName",
                sectorName, 
                plantRow
        ) t2 ON t1."refStructureName" = t2."refStructureName"
            AND t1."companyName" = t2."companyName"
            AND t1."fieldName" = t2."fieldName"
            AND t1.sectorName = t2.sectorName
            AND t1.plantRow = t2.plantRow
            AND t1.timestamp = t2.max_timestamp`

    const result = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: {
        refStructureName,
        companyName,
        fieldName,
        sectorName,
        plantRow
      }
    });

    if(result && result.length === 1) {
      return new WateringAdviceDto(result[0].advice, new Date(result[0].timestamp * 1000).toISOString(), new Date(result[0].wateringHour * 1000).toISOString())
    } else return new WateringAdviceDto(-1, -1, -1)
  }

  async createTranscodingField(source, refStructureName, companyName, fieldName, coltureType, sectorName, wateringcapacity, initialwatering, maximumwatering, advicetime, wateringtype, adviceweight, plantRowname, sensorNumber, sensorid, sensorname, sensortype, x, y, z) {
    const model = this.TranscodingField.build({
      source: source,
      refStructureName: refStructureName,
      companyName: companyName,
      fieldName: fieldName,
      coltureType: coltureType,
      sectorName: sectorName,
      wateringcapacity: wateringcapacity,
      initialwatering: initialwatering,
      maximumwatering: maximumwatering,
      advicetime: advicetime,
      wateringtype: wateringtype,
      adviceweight: adviceweight,
      plantRow: plantRowname,
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

  async getFieldDetails(refStructureName, companyName, fieldName, sectorName, plantRow) {
    try {
      this.TranscodingField.removeAttribute('id')
      return await this.TranscodingField.findOne({
        where: {
          refStructureName: refStructureName,
          companyName: companyName,
          fieldName: fieldName,
          sectorName: sectorName,
          plantRow: plantRow,
        }
      });
    } catch (error) {
      console.error('Error on find field details:', error);
    }
  }

  async getDripperInfo(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp) {
    try {
      this.WateringFields.removeAttribute('id')
      const result = await this.WateringFields.findOne({
        where: {
          refStructureName: refStructureName,
          companyName: companyName,
          fieldName: fieldName,
          sectorName: sectorName,
          plantRow: plantRow,
          timestamp_from: { [Op.lt]: timestamp },
          timestamp_to: {
            [Op.or]: {
              [Op.is]: null,
              [Op.gt]: timestamp
            },
          }
        }
      });
      const dripper = {
        x: result.dataValues.dripper_pos,
        y: 0
      }
      return dripper
    } catch (error) {
      console.error('Error on find field details:', error);
    }
  }
}

module.exports = FieldRepository