import { HttpsProxyAgent } from 'https-proxy-agent'

export const getAxiosProxyConfiguration = (proxyConfig: string): HttpsProxyAgent<string> => {
  const httpsAgent = new HttpsProxyAgent(proxyConfig)
  return httpsAgent
}
