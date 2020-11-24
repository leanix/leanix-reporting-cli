import * as rimraf from 'rimraf';
import { exec } from 'child_process';
import { writeFile } from 'fs';
import { promisify } from 'util';

export const execAsync = promisify(exec);
export const writeFileAsync = promisify(writeFile);
export const rimrafAsync = promisify(rimraf);
