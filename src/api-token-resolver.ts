import * as rp from 'request-promise-native';

export class ApiTokenResolver {

  public static getAccessToken(host: string, apiToken: string) {
  const base64ApiToken = new Buffer('apitoken:' + apiToken).toString('base64');
  let options = {
    url: host + '/services/mtm/v1/oauth2/token',
    headers: { 'Authorization': 'Basic ' + base64ApiToken },
    form: { grant_type: 'client_credentials' }
  };
  if (process.env.PROXY_URL) {
    Object.assign(options, {proxy: process.env.PROXY_URL})
  }
  return rp.post(options)
    .then(response => JSON.parse(response)['access_token']);
}

}