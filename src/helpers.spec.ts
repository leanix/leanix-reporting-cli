import type { AxiosRequestConfig } from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { getAxiosProxyConfiguration } from './helpers'

describe('the helpers', () => {
  it('provide a method to add proxy configuration to axios', () => {
    const proxyConfig = 'http://localhost:8080'
    const config: AxiosRequestConfig = {}
    config.httpsAgent = getAxiosProxyConfiguration(proxyConfig)
    expect(config.httpsAgent).toBeInstanceOf(HttpsProxyAgent)
  })
})
