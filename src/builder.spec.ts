import { Builder } from './builder';

describe('Builder', () => {
  const rimraf = jest.fn().mockResolvedValue(undefined);
  const exec = jest.fn().mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });
  const console = {
    log: jest.fn(),
    error: jest.fn()
  };

  afterEach(() => {
    rimraf.mockClear();
    exec.mockClear();
    console.log.mockClear();
    console.error.mockClear();
  });

  it.each([
    ['public', 'npx parcel'],
    ['./public', './build.sh'],
    ['/tmp/dist', '/usr/bin/make report']
  ])('builds with dist path "%s" and build command "%s"', async (distPath, buildCommand) => {
    const builder = new Builder({ distPath, buildCommand }, rimraf, exec, console);

    await builder.build();

    expect(rimraf).toHaveBeenCalledWith(distPath);
    expect(exec).toHaveBeenCalledWith(buildCommand);
    expect(console.log).toHaveBeenCalledWith('stdout');
  });
});
