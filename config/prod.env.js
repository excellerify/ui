const { argv } = require('yargs');

const apiHost = process.env.EXCELLERIFY_CUSTOM_HOST || 'localhost';
const apiPort = process.env.EXCELLERIFY_CUSTOM_PORT || '3000';
let apiVersion = process.env.EXCELLERIFY_API_VERSION || 'v1';

apiVersion = apiVersion ? `/${apiVersion}/` : '/';

const apiUrl =
  process.env.API_URL || argv.apiUrl || `"http://${apiHost}:${apiPort}/api${apiVersion}"`;

console.log(apiUrl);

module.exports = {
  NODE_ENV: '"production"',
  API_URL: `"${apiUrl}/"`
};
