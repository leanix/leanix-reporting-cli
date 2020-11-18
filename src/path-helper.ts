import * as path from 'path';

export class PathHelper {

  public getProjectDirectory(): string {
    return process.cwd();
  }

  public getLxrConfigPath(): string {
    return path.resolve(this.getProjectDirectory(), 'lxr.json');
  }

  public getTemplateDirectory(): string {
    return path.resolve(__dirname, '../template');
  }
}
