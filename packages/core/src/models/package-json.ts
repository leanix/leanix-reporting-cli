import zod from 'zod'

export const packageJsonLxrSchema = zod.object({
  name: zod.string(),
  version: zod.string(),
  author: zod.string(),
  description: zod.string(),
  leanixReport: zod.object({
    id: zod.string(),
    title: zod.string(),
    defaultConfig: zod.record(zod.string(), zod.any()).optional()
  })
})

export type PackageJsonLXR = zod.infer<typeof packageJsonLxrSchema>
