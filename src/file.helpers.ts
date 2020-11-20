import { readFileSync } from 'fs';

import { getProjectDirectoryPath } from './path.helpers';
import { LxrConfig, PackageJson } from './interfaces';

export function readJsonFile(path: string): unknown {
  const buffer = readFileSync(path);
  return JSON.parse(buffer.toString('utf-8'));
}

export function loadLxrConfig(): LxrConfig {
  const lxrConfigPath = getProjectDirectoryPath('lxr.json')
  return readJsonFile(lxrConfigPath) as LxrConfig;
}

export function loadPackageJson(): PackageJson {
  const packageJsonPath = getProjectDirectoryPath('package.json')
  return readJsonFile(packageJsonPath) as PackageJson;
}
