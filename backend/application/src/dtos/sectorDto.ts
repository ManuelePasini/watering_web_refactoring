import { EntityRef, ThesisData } from "./thesisDto.js"

type GeoJsonGeometry = Record<string, unknown> | null | undefined

export class Sector {
  name: string
  farmId?: number | null
  culture?: string | null
  cultureType?: string | null
  location?: GeoJsonGeometry
  dripperCapacity?: number | null
  sprinklerCapacity?: number | null
  doubleWing?: boolean | null
  createdAt?: number | null

  constructor(
    sectorName: string,
    farmId?: number | null,
    culture?: string | null,
    cultureType?: string | null,
    location?: GeoJsonGeometry,
    dripperCapacity?: number | null,
    sprinklerCapacity?: number | null,
    doubleWing?: boolean | null,
    createdAt?: number | null
  ) {
    this.name = sectorName
    this.farmId = farmId
    this.culture = culture
    this.cultureType = cultureType
    this.location = location
    this.dripperCapacity = dripperCapacity
    this.sprinklerCapacity = sprinklerCapacity
    this.doubleWing = doubleWing
    this.createdAt = createdAt
  }
}

export class SectorCompact {
  id: number
  name: string
  culture?: string | null
  cultureType?: string | null
  location?: GeoJsonGeometry
  createdAt?: number | null
  disabledAt?: number | null
  farm?: EntityRef
  company?: EntityRef

  constructor(sectorId: number, sectorName: string, culture: string | null | undefined, cultureType: string | null | undefined, location: GeoJsonGeometry, farm: EntityRef, company: EntityRef, createdAt?: number | null, disabledAt?: number | null) {
    this.id = sectorId
    this.name = sectorName
    this.culture = culture
    this.cultureType = cultureType
    this.location = location
    this.createdAt = createdAt
    this.disabledAt = disabledAt
    this.farm = farm
    this.company = company
  }
}

export class SectorData {
  id: number
  name?: string | null
  culture?: string | null
  cultureType?: string | null
  location?: GeoJsonGeometry
  dripperCapacity?: number | null
  sprinklerCapacity?: number | null
  doubleWing?: boolean | null
  farm?: EntityRef | {location: GeoJsonGeometry}
  company?: EntityRef
  theses?: ThesisData[]
  createdAt?: number | null
  disabledAt?: number | null

  constructor(
    sectorId: number,
    sectorName?: string | null,
    culture?: string | null,
    cultureType?: string | null,
    location?: GeoJsonGeometry,
    dripperCapacity?: number | null,
    sprinklerCapacity?: number | null,
    doubleWing?: boolean | null,
    farm?: EntityRef | {location: GeoJsonGeometry},
    company?: EntityRef,
    theses?: EntityRef[],
    createdAt?: number | null,
    disabledAt?: number | null
  ) {
    this.id = sectorId
    this.name = sectorName
    this.culture = culture
    this.cultureType = cultureType
    this.location = location
    this.dripperCapacity = dripperCapacity
    this.sprinklerCapacity = sprinklerCapacity
    this.doubleWing = doubleWing
    this.farm = farm
    this.company = company
    this.theses = theses
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}

export class Service {
  name: string
  id: number

  constructor(serviceName: string, serviceId: number) {
    this.name = serviceName
    this.id = serviceId
  }
}

export class SectorService extends Service {
  validFrom?: number | null
  validTo?: number | null

  constructor(serviceName: string, serviceId: number, validFrom?: number | null, validTo?: number | null) {
    super(serviceName, serviceId)
    this.validFrom = validFrom
    this.validTo = validTo
  }
}
