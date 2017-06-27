import * as path from 'path';

export class PathHelper {

  public getSourceDirectory() {
    return path.resolve(__dirname, '..');
  }

  public getTargetDirectory() {
    return process.cwd();
  }

  public getTemplateDirectory() {
    return path.resolve(__dirname, '../template');
  }

  public getTemplateSourcePath(templateFileName: string) {
    const sourceDir = this.getSourceDirectory();
    return path.resolve(sourceDir, 'template', templateFileName);
  }

  public getTargetFolderPath(filename: string) {
    const targetDir = this.getTargetDirectory();
    return path.resolve(targetDir, filename);
  }
}
