import { TABLES } from '../commons/constants.js'
import { Organization } from '../dtos/organizationDto.js'
import OrganizationRepository from '../persistency/repository/OrganizationRepository.js'
import DtoConverter from './DtoConverter.js'
import type UserActionService from './UserActionService.js'

const dtoConverter = new DtoConverter()

class OrganizationService {
  private organizationRepository: OrganizationRepository
  private userActionService: UserActionService

  constructor(organizationRepository: OrganizationRepository, userActionService: UserActionService) {
    this.organizationRepository = organizationRepository
    this.userActionService = userActionService
  }

  async createOrganization(userId: number, organizationName: string): Promise<number | undefined> {
    try {
      const organizationCreated = await this.organizationRepository.createOrganization(organizationName)
      const organizationId = organizationCreated.id
      if (organizationId) {
        this.userActionService.logCreation(userId, TABLES.ORGANIZATION, organizationId, null)
        return organizationId
      }
    } catch (error) {
      console.error(`Error creating organization ${organizationName}: ${error.message}`)
      throw error
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const result = await this.organizationRepository.getOrganizations()
    return dtoConverter.convertOrganizationsDataWrapper(result)
  }

  async getOrganizationDetails(organizationId: number, userId: number, isAdmin: boolean): Promise<unknown> {
    return await this.organizationRepository.getOrganizationDetails(organizationId, userId, isAdmin)
  }
}

export default OrganizationService
