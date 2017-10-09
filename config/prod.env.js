const apiHost = process.env.EXCELLERIFY_CUSTOM_HOST
const apiPort = process.env.EXCELLERIFY_CUSTOM_PORT
const apiVersion = process.env.EXCELLERIFY_API_VERSION

module.exports = {
  NODE_ENV: '"production"',
  API_URL: `"http://${apiHost}:${apiPort}/api/${apiVersion + '/' || ''}"`
}
