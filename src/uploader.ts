import type { AxiosRequestConfig } from 'axios'
import fs from 'node:fs'
import axios from 'axios'
import chalk from 'chalk'
import FormData from 'form-data'
import { ApiTokenResolver } from './api-token-resolver'
import { getAxiosProxyConfiguration } from './helpers'
import { getProjectDirectoryPath } from './path.helpers'

export class Uploader {
  public async upload(url: string, apitoken: string, tokenhost: string, proxy?: string): Promise<boolean> {
    const accessToken = await ApiTokenResolver.getAccessToken(`https://${tokenhost}`, apitoken, proxy)
    return await this.executeUpload(url, accessToken, proxy)
  }

  private async executeUpload(url: string, accessToken: string, proxy?: string) {
    console.log(chalk.yellow(chalk.italic(`Uploading to ${url} ${proxy ? `through a proxy` : ``}...`)))

    const formData = new FormData()
    formData.append('file', fs.createReadStream(getProjectDirectoryPath('bundle.tgz')))

    const options: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    }

    if (proxy) {
      options.httpsAgent = getAxiosProxyConfiguration(proxy)
    }

    try {
      const response = await axios.post(url, formData, options)
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
