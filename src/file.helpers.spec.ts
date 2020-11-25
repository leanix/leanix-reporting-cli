import { loadCliConfig } from './file.helpers';
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
});
