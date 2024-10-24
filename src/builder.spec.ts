import * as asyncHelpers from './async.helpers';
import { Builder } from './builder';

describe('Builder', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn()
  };

  const builder = new Builder(logger);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['public', 'npx parcel'],
    ['./public', './build.sh'],
    ['/tmp/dist', '/usr/bin/make report']
  ])('builds with dist path "%s" and build command "%s"', async (distPath, buildCommand) => {
    // Mock the implementation for rimrafAsync and execAsync
    const rimrafAsyncMock = jest.spyOn(asyncHelpers, 'rimrafAsync').mockResolvedValue(undefined);
    const execAsyncMock = jest.spyOn(asyncHelpers, 'execAsync').mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });

    await builder.build(distPath, buildCommand);

    expect(rimrafAsyncMock).toHaveBeenCalledWith(distPath);
    expect(execAsyncMock).toHaveBeenCalledWith(buildCommand);
    expect(logger.log).toHaveBeenCalledWith('stdout');
  });
});
