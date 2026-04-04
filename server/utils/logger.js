import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getLogStream = (type) => {
  const date = new Date().toISOString().split('T')[0];
  return fs.createWriteStream(path.join(logDir, `${type}-${date}.log`), { flags: 'a' });
};

export const logger = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message}\n`;
    console.log(log);
    getLogStream('info').write(log);
  },
  
  error: (message, error) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message}\n${error?.stack || ''}\n`;
    console.error(log);
    getLogStream('error').write(log);
  },
  
  fraud: (message, data) => {
    const log = `[FRAUD] ${new Date().toISOString()} - ${message}\n${JSON.stringify(data)}\n`;
    console.warn(log);
    getLogStream('fraud').write(log);
  }
};