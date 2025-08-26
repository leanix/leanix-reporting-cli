export type ResponseStatus = 'OK' | 'ERROR'

export interface PathfinderReportUploadError {
  value: 'error'
  messages: string[]
}

export interface PathfinderResponseData {
  status: ResponseStatus
  type: string
  data?: unknown
  errorMessage?: string
  errors?: PathfinderReportUploadError[]
}
