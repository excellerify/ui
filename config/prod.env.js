const apiHost = process.env.EXCELLERIFY_CUSTOM_HOST
const apiPort = process.env.EXCELLERIFY_CUSTOM_PORT

module.exports = {
  NODE_ENV: '"production"',
  API_URL: `"http://${apiHost}:${apiPort}/api/"`
}
