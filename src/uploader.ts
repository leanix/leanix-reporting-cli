import type { AxiosRequestConfig } from 'axios'
import fs from 'node:fs'
import axios from 'axios'
import chalk from 'chalk'
import FormData from 'form-data'
import { ApiTokenResolver } from './api-token-resolver'
import { getAxiosProxyConfiguration, getJwtClaims } from './helpers'
import { getProjectDirectoryPath } from './path.helpers'

export class Uploader {
  public async upload(params: { tokenhost: string, apitoken: string, proxyURL?: string, store?: { assetVersionId: string, host?: string } }) {
    const { tokenhost, apitoken, proxyURL, store } = params
    const accessToken = await ApiTokenResolver.getAccessToken(`https://${tokenhost}`, apitoken, proxyURL)

    const claims = getJwtClaims(accessToken)
    let url: string
    if (store) {
      const { host = 'store.leanix.net', assetVersionId } = store
      url = `https://${host}/services/torg/v1/assetversions/${assetVersionId}/payload`
    }
    else {
      url = `${claims.instanceUrl}/services/pathfinder/v1/reports/upload`
    }

    console.log(chalk.yellow(chalk.italic(`Uploading to ${url} ${proxyURL ? `through a proxy` : ``}...`)))

    const formData = new FormData()
    formData.append('file', fs.createReadStream(getProjectDirectoryPath('bundle.tgz')))

    const options: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    }

    if (proxyURL) {
      options.httpsAgent = getAxiosProxyConfiguration(proxyURL)
    }

    try {
      const response = await axios.post(url.toString(), formData, options)
      if (response.data.status === 'OK') {
        console.log(chalk.green('\u2713 Project successfully uploaded!'))
        return true
      }
      else if (response.data.status === 'ERROR') {
        console.log(chalk.red(`ERROR: ${response.data.errorMessage}`))
        return false
      }
    }
    catch (err) {
      if (err.response && err.response.data && err.response.data.errorMessage) {
        console.log(chalk.red(`ERROR: ${err.response.data.errorMessage}`))
      }
      else {
        console.log(chalk.red(`ERROR: ${err.message}`))
      }
      return false
    }
  }
}
