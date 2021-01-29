import { readFileSync } from 'fs';
import { CliConfig, LxrConfig, PackageJson } from './interfaces';
import { getProjectDirectoryPath } from './path.helpers';

export function readJsonFile<T>(path: string): T {
  const buffer = readFileSync(path);
  return JSON.parse(buffer.toString('utf-8'));
}

export function loadLxrConfig(configPath = 'lxr.json'): LxrConfig {
  const lxrConfigPath = getProjectDirectoryPath(configPath);
  return readJsonFile(lxrConfigPath);
}

export function loadPackageJson(): PackageJson {
  const packageJsonPath = getProjectDirectoryPath('package.json');
  return readJsonFile(packageJsonPath);
}

export function loadCliConfig(packageJson = loadPackageJson()): CliConfig {
  const leanixReportingCli = packageJson.leanixReportingCli || {};

  return {
    distPath: leanixReportingCli.distPath ?? './dist',
    buildCommand: leanixReportingCli.buildCommand ?? './node_modules/.bin/webpack'
  };
}
