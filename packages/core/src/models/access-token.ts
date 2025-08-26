import zod from 'zod'

export const accessTokenSchema = zod.object({
  accessToken: zod.string(),
  expired: zod.boolean(),
  expiresIn: zod.number(),
  scope: zod.string(),
  tokenType: zod.string()
})

export type AccessToken = zod.infer<typeof accessTokenSchema>
