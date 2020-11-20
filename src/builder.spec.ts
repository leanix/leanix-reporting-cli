import { Builder } from './builder';

describe('Builder', () => {
  const loadPackageJson = jest.fn();
  const rimraf = jest.fn().mockResolvedValue(undefined);
  const exec = jest.fn().mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });
  const console = {
    log: jest.fn(),
    error: jest.fn()
  };

  const builder = new Builder(loadPackageJson, rimraf, exec, console);

  afterEach(() => {
    loadPackageJson.mockClear();
    rimraf.mockClear();
    exec.mockClear();
    console.log.mockClear();
    console.error.mockClear();
  });

  it('builds with default configuration', async () => {
    loadPackageJson.mockReturnValueOnce({});

    await builder.build();

    expect(rimraf).toHaveBeenCalledWith('./dist');
    expect(exec).toHaveBeenCalledWith('./node_modules/.bin/webpack');
    expect(console.log).toHaveBeenCalledWith('stdout');
  });

  it.each([
    'public',
    './public',
    '/tmp/dist'
  ])('removes custom dist path "%s"', async (distPath) => {
    loadPackageJson.mockReturnValueOnce({
      leanixReportingCli: {
        distPath
      }
    });

    await builder.build();

    expect(rimraf).toHaveBeenCalledWith(distPath);
  });

  it.each([
    'parcel',
    './build.sh',
    '/usr/bin/make',
    'node_modules/.bin/broccoli build',
    'npx grunt'
  ])('builds using custom command "%s"', async (buildCommand) => {
    loadPackageJson.mockReturnValueOnce({
      leanixReportingCli: {
        buildCommand
      }
    });

    await builder.build();

    expect(exec).toHaveBeenCalledWith(buildCommand);
  });
});
