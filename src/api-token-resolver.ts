import axios from 'axios';

export class ApiTokenResolver {
  public static getAccessToken(host: string, apiToken: string, proxy?: string): Promise<string> {
    const base64ApiToken = Buffer.from('apitoken:' + apiToken).toString('base64');
    const data = { grant_type: 'client_credentials' };
    const [proxyHost, proxyPort] = proxy?.split(':') ?? [];
    const config = {
      headers: { Authorization: 'Basic ' + base64ApiToken },
      proxy: proxyHost && proxyPort ? { host: proxyHost, port: parseInt(proxyPort) } : undefined
    };
    const url = host + '/services/mtm/v1/oauth2/token';
    return axios.post(url, data, config).then((response) => response.data['access_token']);
  }
}
