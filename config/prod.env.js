"use strict";

const apiHost = process.env.EXCELLERIFY_CUSTOM_HOST || ""
const apiPort = process.env.EXCELLERIFY_CUSTOM_PORT || ""
var apiVersion = process.env.EXCELLERIFY_API_VERSION || ""

apiVersion = apiVersion ? "/" + apiVersion + "/" : "/"

module.exports = {
  NODE_ENV: '"production"',
  API_URL: '"http://' + apiHost + ":" + apiPort + "/api" + apiVersion + '"'
}
