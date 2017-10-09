const apiVersion = process.env.EXCELLERIFY_API_VERSION

var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL: `"http://localhost:3000/api/${apiVersion + '/' || ''}"`
})
