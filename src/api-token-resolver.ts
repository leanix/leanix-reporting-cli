import * as rp from 'request-promise-native';

export class ApiTokenResolver {

  public static getAccessToken(apiToken: string) {
  const host = 'https://svc.leanix.net';
  const base64ApiToken = new Buffer('apitoken:' + apiToken).toString('base64');
  const options = {
    url: host + '/services/mtm/v1/oauth2/token',
    headers: { 'Authorization': 'Basic ' + base64ApiToken },
    form: { grant_type: 'client_credentials' }
  };
  return rp.post(options)
    .then(response => JSON.parse(response)['access_token']);
}

}