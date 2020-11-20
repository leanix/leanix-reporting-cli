import * as path from 'path';

export class PathHelper {

  public getSourceDirectory(): string {
    return path.resolve(__dirname, '..');
  }

  public getProjectDirectory(): string {
    return process.cwd();
  }

  public getLxrConfigPath(): string {
    return path.resolve(this.getProjectDirectory(), 'lxr.json');
  }

  public getTemplateDirectory(): string {
    return path.resolve(__dirname, '../template');
  }

  public getTemplateSourcePath(templateFileName: string): string {
    const sourceDir = this.getSourceDirectory();
    return path.resolve(sourceDir, 'template', templateFileName);
  }

  public getTargetFolderPath(filename: string): string {
    const targetDir = this.getProjectDirectory();
    return path.resolve(targetDir, filename);
  }
}
