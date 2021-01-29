import * as fs from 'fs';
import { resolve } from 'path';
import { loadCliConfig, loadLxrConfig } from './file.helpers';
import { PackageJson } from './interfaces';

describe('File Helpers', () => {
  describe('loadCliConfig()', () => {
    it('loads default values', () => {
      const packageJson: PackageJson = {};

      expect(loadCliConfig(packageJson)).toEqual({
        distPath: './dist',
        buildCommand: './node_modules/.bin/webpack'
      });
    });

    it('loads override value for distPath', () => {
      const packageJson: PackageJson = {
        leanixReportingCli: {
          distPath: '/tmp/build'
        }
      };

      expect(loadCliConfig(packageJson)).toMatchObject({
        distPath: '/tmp/build'
      });
    });

    it('loads override value for buildCommand', () => {
      const packageJson: PackageJson = {
        leanixReportingCli: {
          buildCommand: 'make report'
        }
      };

      expect(loadCliConfig(packageJson)).toMatchObject({
        buildCommand: 'make report'
      });
    });
  });

  describe('loadLxrConfig()', () => {
    const rootDir = resolve(__dirname, '..');
    let cwdSpy: jest.SpyInstance, readFileSyncSpy: jest.SpyInstance;

    beforeEach(() => {
      cwdSpy = jest.spyOn(process, 'cwd');
      readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockImplementation();

      cwdSpy.mockReturnValue(rootDir);
      readFileSyncSpy.mockReturnValue(Buffer.from('{}'));
    });

    afterEach(() => {
      cwdSpy.mockRestore();
      readFileSyncSpy.mockRestore();
    });

    it('loads lxr.json from default location', () => {
      loadLxrConfig();

      expect(fs.readFileSync).toHaveBeenCalledWith(resolve(rootDir, 'lxr.json'));
    });

    it('loads lxr.json from given location', () => {
      loadLxrConfig('./config/lxr.json');

      expect(fs.readFileSync).toHaveBeenCalledWith(resolve(rootDir, './config/lxr.json'));
    });
  });
});
