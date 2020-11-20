import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = readFileSync(join(__dirname, '../package.json'));
export const version = JSON.parse(packageJson.toString('utf-8')).version;
