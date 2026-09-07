export class WateringAdvice {
  thesisName: string
  advice?: string | number | boolean | null
  duration?: number | null
  imageTimestamp?: number | null
  wateringStart?: number | null
  r?: number | null
  lastWatering?: number | null
  baselineFlag?: boolean | null

  constructor(thesisName: string, advice?: string | number | boolean | null, duration?: number | null, imageTimestamp?: number | null, wateringStart?: number | null, r?: number | null, lastWatering?: number | null, baselineFlag?: boolean | null) {
    this.thesisName = thesisName
    this.advice = advice
    this.duration = duration
    this.imageTimestamp = imageTimestamp
    this.wateringStart = wateringStart
    this.r = r
    this.lastWatering = lastWatering
    this.baselineFlag = baselineFlag
  }
}
