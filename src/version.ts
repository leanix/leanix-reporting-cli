import { join } from 'path';
import { readJsonFile } from './file.helpers';

const packageJson = readJsonFile(join(__dirname, '../package.json'));
export const version = packageJson['version'];
