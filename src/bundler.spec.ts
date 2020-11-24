import * as tar from 'tar';
import * as fs from 'fs';
import * as asyncHelpers from './async.helpers';
import { Bundler } from './bundler';
import * as fileHelpers from './file.helpers';

describe('Bundler', () => {
  const writeFileAsync = jest.spyOn(asyncHelpers, 'writeFileAsync').mockResolvedValue(undefined);
  const tarC = jest.spyOn(tar, 'c').mockResolvedValue(undefined as never);

  jest.spyOn(fileHelpers, 'loadPackageJson').mockReturnValue({
    name: 'my-report',
    version: '1.0.0',
    author: 'Jane Doe',
    description: 'My report description',
    documentationLink: 'https://example.com',
    leanixReport: {
      id: 'com.example.myReport',
      title: 'My Report'
    }
  });

  jest.spyOn(fs, 'readdirSync').mockImplementation(((path) => {
    if (path === 'source') {
      return ['report.ts', 'style.scss'];
    } else if (path === 'output') {
      return ['report.js', 'style.css', 'index.html'];
    }
  }) as typeof fs.readdirSync);

  beforeEach(async () => {
    const bundler = new Bundler();
    await bundler.bundle('source', 'output');
  });

  afterEach(() => {
    writeFileAsync.mockClear();
    tarC.mockClear();
  });

  it('writes lxreport.json', async () => {
    expect(writeFileAsync).toHaveBeenCalledWith(
      'output/lxreport.json',
      JSON.stringify({
        name: 'my-report',
        version: '1.0.0',
        author: 'Jane Doe',
        description: 'My report description',
        documentationLink: 'https://example.com',
        id: 'com.example.myReport',
        title: 'My Report'
      })
    );
  });

  it('creates src.tgz', () => {
    expect(tarC).toHaveBeenCalledWith({ gzip: true, cwd: 'source', file: 'output/src.tgz' }, ['report.ts', 'style.scss']);
  });

  it('creates bundle.tgz', () => {
    expect(tarC).toHaveBeenCalledWith({ gzip: true, cwd: 'output', file: 'bundle.tgz' }, ['report.js', 'style.css', 'index.html']);
  });
});
