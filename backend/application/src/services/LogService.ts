type LogRepository = {
  getThesisLogs(thesisId: number, timestampFrom?: number | null, timestampTo?: number | null): Promise<unknown[]>
}

class LogService {
  private logRepository: LogRepository
  private userActionService: unknown

  constructor(logRepository: LogRepository, userActionService: unknown) {
    this.logRepository = logRepository
    this.userActionService = userActionService
  }

  async getThesisLogs(thesisId: number, timestampFrom?: number | null, timestampTo?: number | null): Promise<unknown[]> {
    const results = await this.logRepository.getThesisLogs(thesisId, timestampFrom, timestampTo)
    return results
  }
}

export default LogService
