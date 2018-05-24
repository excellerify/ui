const baseUrl = 'http://localhost:7001'; // Admin UI base URL
const apiBaseUrl = process.env.API_URL || 'http://localhost:3000';

const config = {
  locale: 'en-US', // en-US, zh-CN
  url: baseUrl,
  ajaxUploadUrl: `${apiBaseUrl}files`,
  debug: {
    mock: false, // enable mock
    http: false // http request log
  },
  api: apiBaseUrl,
  grid: {
    limit: 25
  },
  format: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm'
  }
};

global.config = config;

export default config;
