import type { PackageJson } from './interfaces'
import { defaultBuildCmd, defaultDistPath, loadCliConfig } from './file.helpers'

describe('file Helpers', () => {
  describe('loadCliConfig()', () => {
    it('loads default values', () => {
      const packageJson: PackageJson = {}

      expect(loadCliConfig(packageJson)).toEqual({
        distPath: defaultDistPath,
        buildCommand: defaultBuildCmd
      })
    })

    it('loads override value for distPath', () => {
      const packageJson: PackageJson = {
        leanixReportingCli: {
          distPath: '/tmp/build'
        }
      }

      expect(loadCliConfig(packageJson)).toMatchObject({
        distPath: '/tmp/build'
      })
    })

    it('loads override value for buildCommand', () => {
      const packageJson: PackageJson = {
        leanixReportingCli: {
          buildCommand: 'make report'
        }
      }

      expect(loadCliConfig(packageJson)).toMatchObject({
        buildCommand: 'make report'
      })
    })
  })
})
