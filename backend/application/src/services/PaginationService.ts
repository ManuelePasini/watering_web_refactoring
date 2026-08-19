export type PaginationMetadata = {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

class PaginationService {
  computePaginationMetadata(totalItems: number, page: number, itemsPerPage: number): PaginationMetadata {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return {
      page,
      pageSize: itemsPerPage,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

export default PaginationService
