
class WateringAdviceDto {

  constructor(timestampFrom, timestampTo, profiles) {
    this.timestampFrom = timestampFrom
    this.timestampTo = timestampTo
    this.profiles = profiles
  }

}

class WateringAdviceProfileData {

  constructor(xx, yy, zz, optValue) {
    this.xx  = xx
    this.yy = yy
    this.zz = zz
    this.optValue = optValue
  }

}

module.exports = {WateringAdviceDto,WateringAdviceProfileData}