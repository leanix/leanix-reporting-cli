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
    author: 'Jane Doe <jane.doe@mail.com>',
    description: 'My report description',
    documentationLink: 'https://example.com',
    leanixReport: {
      id: 'com.example.myReport',
      title: 'My Report'
    }
  });

  // Jest uses the typing for the fs.Dirent[] overload of the function even though we use the
  // one that returns string[], hence the forced type casting.
  jest.spyOn(fs, 'readdirSync').mockReturnValue((['report.js', 'style.css', 'index.html'] as unknown) as fs.Dirent[]);

  beforeEach(async () => {
    const bundler = new Bundler();
    await bundler.bundle('output');
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
        author: 'Jane Doe (jane.doe@mail.com)',
        description: 'My report description',
        documentationLink: 'https://example.com',
        id: 'com.example.myReport',
        title: 'My Report'
      })
    );
  });

  it('creates bundle.tgz', () => {
    expect(tarC).toHaveBeenCalledWith({ gzip: true, cwd: 'output', file: 'bundle.tgz' }, ['report.js', 'style.css', 'index.html']);
  });
});
