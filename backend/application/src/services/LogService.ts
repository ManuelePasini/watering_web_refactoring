type LogRepository = {
  getThesisLogs(thesisId: number, timestampFrom?: number | null, timestampTo?: number | null): Promise<unknown[]>
}

class LogService {
  private logRepository: LogRepository

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository
  }

  async getThesisLogs(thesisId: number, timestampFrom?: number | null, timestampTo?: number | null): Promise<unknown[]> {
    const results = await this.logRepository.getThesisLogs(thesisId, timestampFrom, timestampTo)
    return results
  }
}

export default LogService
