import * as asyncHelpers from './async.helpers';
import { Builder } from './builder';

jest.mock('./async.helpers');

describe('Builder', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn()
  };

  const builder = new Builder(logger);

  afterEach(() => {
    logger.log.mockClear();
    logger.error.mockClear();
  });

  it.each([
    ['public', 'npx parcel'],
    ['./public', './build.sh'],
    ['/tmp/dist', '/usr/bin/make report']
  ])('builds with dist path "%s" and build command "%s"', async (distPath, buildCommand) => {
    const rimrafAsync = jest.spyOn(asyncHelpers, 'rimrafAsync').mockResolvedValue(undefined);
    const execAsync = jest.spyOn(asyncHelpers, 'execAsync').mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });

    await builder.build(distPath, buildCommand);

    expect(rimrafAsync).toHaveBeenCalledWith(distPath);
    expect(execAsync).toHaveBeenCalledWith(buildCommand);
    expect(logger.log).toHaveBeenCalledWith('stdout');
  });
});
