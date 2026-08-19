export class WateringScheduleResponse {
  sectorId: number
  sectorName?: string | null
  events: WateringEventData[]

  constructor(sectorId: number, events: WateringEventData[] = [], sectorName?: string | null) {
    this.sectorId = sectorId
    this.sectorName = sectorName
    this.events = events
  }
}

export class WateringEventData {
  id: number
  date?: number | string | null
  wateringStart: number
  wateringEnd?: number | null
  duration?: number | null
  enabled?: boolean | null
  scheduled?: boolean | null
  advice?: unknown
  expectedWater?: number | null
  note?: string | null
  updateTimestamp?: number | null
  updatedBy?: unknown
  theses?: ThesisContributionData[]

  constructor(eventId: number, date: number | string | null | undefined, wateringStart: number, wateringEnd: number | null | undefined, duration: number | null | undefined, enabled: boolean | null | undefined, scheduled: boolean | null | undefined, advice: unknown, expectedWater: number | null | undefined, note: string | null | undefined, updateTimestamp: number | null | undefined, updatedBy: unknown, theses?: ThesisContributionData[]) {
    this.id = eventId
    this.date = date
    this.wateringStart = wateringStart
    this.wateringEnd = wateringEnd
    this.duration = duration
    this.enabled = enabled
    this.scheduled = scheduled
    this.advice = advice
    this.expectedWater = expectedWater
    this.note = note
    this.updateTimestamp = updateTimestamp
    this.updatedBy = updatedBy
    this.theses = theses
  }
}

export class ThesisContributionData {
  thesisId: number
  thesisName: string
  weight?: number | null
  imageTimestamp?: number | null

  constructor(thesisId: number, thesisName: string, weight?: number | null, imageTimestamp?: number | null) {
    this.thesisId = thesisId
    this.thesisName = thesisName
    this.weight = weight
    this.imageTimestamp = imageTimestamp
  }
}

type WateringEventArgs = {
  sectorId: number
  wateringStart: number
  expectedWater?: number | null
  note?: string | null
  enabled?: boolean
}

export class WateringEvent {
  sectorId: number
  wateringStart: number
  expectedWater?: number | null
  note?: string | null
  enabled: boolean

  constructor({ sectorId, wateringStart, expectedWater, note, enabled = true }: WateringEventArgs) {
    this.sectorId = sectorId
    this.wateringStart = wateringStart
    this.expectedWater = expectedWater
    this.note = note
    this.enabled = enabled
  }
}
