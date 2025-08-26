import zod from 'zod'

export const leanixCredentialsSchema = zod.object({
  host: zod.string(),
  apitoken: zod.string(),
  proxyURL: zod.string().optional(),
  store: zod.object({
    host: zod.string().optional(),
    assetId: zod.string()
  }).optional()

})

export type LeanIXCredentials = zod.infer<typeof leanixCredentialsSchema>
