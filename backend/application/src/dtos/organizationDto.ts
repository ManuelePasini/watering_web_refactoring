export class Organization {
  name: string
  id?: number | null

  constructor(organizationName: string, id?: number | null) {
    this.name = organizationName
    this.id = id
  }
}

export class OrganizationData {
  id: number
  name: string
  companies: unknown[]

  constructor(organizationId: number, organizationName: string, companies: unknown[]) {
    this.id = organizationId
    this.name = organizationName
    this.companies = companies
  }
}
