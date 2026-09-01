export class Thesis {
  name: string
  sectorId?: number | null
  validFrom?: number | null
  validTo?: number | null
  weight?: number | null

  constructor(
    thesisName: string,
    sectorId?: number | null,
    weight?: number | null,
    validFrom?: number | null,
    validTo?: number | null
  ) {
    this.name = thesisName
    this.sectorId = sectorId
    this.validFrom = validFrom
    this.validTo = validTo
    this.weight = weight
  }
}

export class ThesisRef {
  id: number
  name: string

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
  }
}

export class ThesisData {
  id: number
  name: string
  validFrom?: number | null
  validTo?: number | null
  weight?: number | null
  company?: unknown
  farm?: unknown
  sector?: unknown

  constructor(
    thesisId: number,
    thesisName: string,
    validFrom?: number | null,
    validTo?: number | null,
    weight?: number | null,
    company?: unknown,
    farm?: unknown,
    sector?: unknown
  ) {
    this.id = thesisId
    this.name = thesisName
    this.validFrom = validFrom
    this.validTo = validTo
    this.weight = weight
    this.company = company
    this.farm = farm
    this.sector = sector
  }
}

export interface ThesisContribution {
    id: number;
    weight?: number | null;
}