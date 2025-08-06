import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getAxiosProxyConfiguration } from './helpers'

export class ApiTokenResolver {
  public static async getAccessToken(host: string, apiToken: string, proxy?: string): Promise<string> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`apitoken:${apiToken}`).toString('base64')}`
      }
    }
    if (proxy) {
      config.httpsAgent = getAxiosProxyConfiguration(proxy)
    }
    const url = `${host}/services/mtm/v1/oauth2/token?grant_type=client_credentials`
    const accessToken = await axios.post(url, {}, config)
      .then(response => response.data.access_token)
    return accessToken
  }
}
