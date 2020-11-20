import { Builder } from './builder';

describe('Builder', () => {
  const processCwd = jest.spyOn(process, 'cwd').mockReturnValue('/home/johndoe/my-report');

  const loadPackageJson = jest.fn();
  const rimraf = jest.fn().mockResolvedValue(undefined);
  const exec = jest.fn().mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });

  const builder = new Builder(loadPackageJson, rimraf, exec);

  afterEach(() => {
    loadPackageJson.mockClear();
    rimraf.mockClear();
    exec.mockClear();
  });

  afterAll(() => {
    processCwd.mockRestore();
  });

  it('builds with default configuration', async () => {
    loadPackageJson.mockReturnValueOnce({});

    await builder.build();

    expect(rimraf).toHaveBeenCalledWith('/home/johndoe/my-report/dist');
    expect(exec).toHaveBeenCalledWith('/home/johndoe/my-report/node_modules/.bin/webpack');
  });

  it.each([
    ['public', '/home/johndoe/my-report/public'],
    ['./public', '/home/johndoe/my-report/public'],
    ['/tmp/dist', '/tmp/dist']
  ])('removes custom dist path "%s"', async (distPath, expectedPath) => {
    loadPackageJson.mockReturnValueOnce({
      leanixReportingCli: {
        distPath
      }
    });

    await builder.build();

    expect(rimraf).toHaveBeenCalledWith(expectedPath);
  });
});
