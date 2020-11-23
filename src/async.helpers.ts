import { exec } from 'child_process';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

export const execAsync = promisify(exec);
export const rimrafAsync = promisify(rimraf);
