import { Builder } from './builder';

describe('Builder', () => {
  const rimraf = jest.fn().mockResolvedValue(undefined);
  const exec = jest.fn().mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });
  const logger = {
    log: jest.fn(),
    error: jest.fn()
  };

  const builder = new Builder(rimraf, exec, logger);

  afterEach(() => {
    rimraf.mockClear();
    exec.mockClear();
    logger.log.mockClear();
    logger.error.mockClear();
  });

  it.each([
    ['public', 'npx parcel'],
    ['./public', './build.sh'],
    ['/tmp/dist', '/usr/bin/make report']
  ])('builds with dist path "%s" and build command "%s"', async (distPath, buildCommand) => {
    await builder.build(distPath, buildCommand);

    expect(rimraf).toHaveBeenCalledWith(distPath);
    expect(exec).toHaveBeenCalledWith(buildCommand);
    expect(logger.log).toHaveBeenCalledWith('stdout');
  });
});
