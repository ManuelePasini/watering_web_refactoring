type GeoJsonGeometry = Record<string, unknown> | null | undefined

export class Farm {
  id?: number | null
  name: string
  companyId?: number | null
  location?: GeoJsonGeometry
  createdAt?: number | null
  disabledAt?: number | null

  constructor(
    farmName: string,
    companyId?: number | null,
    location?: GeoJsonGeometry,
    farmId?: number | null,
    createdAt?: number | null,
    disabledAt?: number | null
  ) {
    this.id = farmId
    this.name = farmName
    this.companyId = companyId
    this.location = location
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}

export class FarmData {
  id: number
  name: string
  location?: GeoJsonGeometry
  company?: unknown
  sectors?: unknown[]
  createdAt?: number | null
  disabledAt?: number | null

  constructor(
    farmId: number,
    farmName: string,
    location?: GeoJsonGeometry,
    company?: unknown,
    sectors?: unknown[],
    createdAt?: number | null,
    disabledAt?: number | null
  ) {
    this.id = farmId
    this.name = farmName
    this.location = location
    this.company = company
    this.sectors = sectors
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}
