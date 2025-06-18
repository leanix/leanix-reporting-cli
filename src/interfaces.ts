export interface LxrConfig {
  host: string
  workspace: string
  apitoken: string
  localPort?: string
  proxyURL?: string
  ssl?: {
    cert: string
    key: string
  }
}

export interface PackageJson {
  name?: string
  version?: string
  author?: string
  description?: string
  documentationLink?: string
  leanixReport?: {
    id?: string
    title?: string
  }
  leanixReportingCli?: Partial<CliConfig>
}

export interface CliConfig {
  distPath: string
  buildCommand: string
}
