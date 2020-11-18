import { getProjectDirectoryPath } from './path.helpers';
import { LxrConfig, PackageJson } from './interfaces';

export function loadLxrConfig(): LxrConfig {
  const lxrConfigPath = getProjectDirectoryPath('lxr.json')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(lxrConfigPath);
}

export function loadPackageJson(): PackageJson {
  const packageJsonPath = getProjectDirectoryPath('package.json')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(packageJsonPath);
}
