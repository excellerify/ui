const { argv } = require('yargs');
const merge = require('webpack-merge');

let apiVersion = process.env.EXCELLERIFY_API_VERSION || '';

apiVersion = apiVersion ? `/${apiVersion}` : '';

const apiUrl = process.env.API_URL || argv.apiUrl || `http://localhost:3000/api${apiVersion}`;

const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL: `"${apiUrl}/"`
});
