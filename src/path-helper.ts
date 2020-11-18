import * as path from 'path';

export class PathHelper {

  public getLxrConfigPath(): string {
    return path.resolve(getProjectDirectory(), 'lxr.json');
  }

  public getTemplateDirectory(): string {
    return path.resolve(__dirname, '../template');
  }
}

export function getProjectDirectory(): string {
  return process.cwd();
}
