import { getProjectDirectoryPath } from './path.helpers';
import { LxrConfig } from './interfaces';

export function loadLxrConfig(): LxrConfig {
  const lxrConfigPath = getProjectDirectoryPath('lxr.json')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(lxrConfigPath);
}
