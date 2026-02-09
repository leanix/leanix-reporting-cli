import fs from 'node:fs'
import * as tar from 'tar'
import * as asyncHelpers from './async.helpers'
import { Bundler } from './bundler'
import * as fileHelpers from './file.helpers'

describe('bundler', () => {
  const writeFileAsync = jest.spyOn(asyncHelpers, 'writeFileAsync').mockResolvedValue(undefined)
  const tarC = jest.spyOn(tar, 'c').mockResolvedValue(undefined as never)

  jest.spyOn(fileHelpers, 'loadPackageJson').mockReturnValue({
    name: 'my-report',
    version: '1.0.0',
    author: 'Jane Doe <jane.doe@mail.com>',
    description: 'My report description',
    documentationLink: 'https://example.com',
    leanixReport: {
      id: 'com.example.myReport',
      title: 'My Report'
    }
  })

  // Mock readdirSync to return string array (using any to bypass strict Dirent typing)
  jest
    .spyOn(fs, 'readdirSync')
    .mockReturnValue(['report.js', 'style.css', 'index.html'] as any)

  beforeEach(async () => {
    const bundler = new Bundler()
    await bundler.bundle('output')
  })

  afterEach(() => {
    writeFileAsync.mockClear()
    tarC.mockClear()
  })

  it('writes lxreport.json', async () => {
    expect(writeFileAsync).toHaveBeenCalledWith(
      'output/lxreport.json',
      JSON.stringify({
        name: 'my-report',
        version: '1.0.0',
        author: 'Jane Doe (jane.doe@mail.com)',
        description: 'My report description',
        documentationLink: 'https://example.com',
        id: 'com.example.myReport',
        title: 'My Report'
      })
    )
  })

  it('creates bundle.tgz', () => {
    expect(tarC).toHaveBeenCalledWith({ gzip: true, cwd: 'output', file: 'bundle.tgz' }, ['report.js', 'style.css', 'index.html'])
  })
})
