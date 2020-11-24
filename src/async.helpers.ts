import * as rimraf from 'rimraf';
import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);
export const rimrafAsync = promisify(rimraf);
