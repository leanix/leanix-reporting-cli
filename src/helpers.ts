import { HttpsProxyAgent } from 'https-proxy-agent'
import jwtDecode from 'jwt-decode'
import z, { ZodError } from 'zod'

export const jwtClaimsPrincipalSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.string(),
  status: z.string(),
  account: z.object({ id: z.string(), name: z.string() }),
  permission: z.object({
    id: z.string(),
    workspaceId: z.string(),
    workspaceName: z.string(),
    role: z.string(),
    status: z.string()
  })
})

export const jwtClaimsSchema = z.object({
  sub: z.string(),
  principal: jwtClaimsPrincipalSchema,
  iss: z.url(),
  jti: z.string(),
  exp: z.number(),
  instanceUrl: z.url(),
  region: z.string()
})

export type TJwtClaims = z.infer<typeof jwtClaimsSchema>

export const getJwtClaims = (bearerToken: string): TJwtClaims => {
  let claims: TJwtClaims
  let claimsUnchecked: unknown
  try {
    claimsUnchecked = jwtDecode(bearerToken)
  }
  catch (err) {
    console.error('could not decode jwt token', err)
    throw err
  }
  try {
    claims = jwtClaimsSchema.parse(claimsUnchecked)
  }
  catch (err) {
    if (err instanceof ZodError) {
      console.error('unexpected jwt claims schema', err.message)
      throw err
    }
  }
  return claims
}

export const getAxiosProxyConfiguration = (proxyConfig: string): HttpsProxyAgent<string> => {
  const httpsAgent = new HttpsProxyAgent(proxyConfig)
  return httpsAgent
}
