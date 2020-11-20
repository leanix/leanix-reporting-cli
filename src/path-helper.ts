import { resolve } from 'path';

export class PathHelper {

  public getLxrConfigPath(): string {
    return getProjectDirectoryPath('lxr.json');
  }

  public getTemplateDirectory(): string {
    return resolve(__dirname, '../template');
  }
}

export function getProjectDirectoryPath(path = ''): string {
  return resolve(process.cwd(), path);
}
