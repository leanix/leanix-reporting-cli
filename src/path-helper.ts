import { join, resolve } from 'path';

export class PathHelper {

  public getLxrConfigPath(): string {
    return getProjectDirectoryPath('lxr.json');
  }

}

export function getProjectDirectoryPath(path = ''): string {
  return resolve(process.cwd(), path);
}

export function getTemplateDirectoryPath(): string {
  return join(__dirname, '../template');
}
