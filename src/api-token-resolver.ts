import axios from 'axios';

export class ApiTokenResolver {
  public static getAccessToken(host: string, apiToken: string, proxy?: string): Promise<string> {
    const [proxyHost, proxyPort] = proxy?.split(':') ?? [];
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from('apitoken:' + apiToken).toString('base64')}`
      },
      proxy: proxyHost && proxyPort ? { host: proxyHost, port: parseInt(proxyPort) } : undefined
    };
    const url = host + '/services/mtm/v1/oauth2/token?grant_type=client_credentials';
    return axios.post(url, {}, config).then((response) => response.data['access_token']);
  }
}
