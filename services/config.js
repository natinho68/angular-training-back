import fs from 'fs';

const configPath = `${__dirname}/../server.conf.json`;

/** @type {{ jwtSecret: string }} */
export const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
