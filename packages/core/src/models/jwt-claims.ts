import zod from 'zod'
import { permissionSchema as permission } from './permission'

export const jwtClaimsSchema = zod.object({
  exp: zod.number(),
  instanceUrl: zod.string(),
  iss: zod.string(),
  jti: zod.string(),
  sub: zod.string(),
  principal: zod.object({
    permission
  })
})

export type JwtClaims = zod.infer<typeof jwtClaimsSchema>
