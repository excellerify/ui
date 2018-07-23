let apiVersion = process.env.EXCELLERIFY_API_VERSION || '';

apiVersion = apiVersion ? `/${apiVersion}` : '';

const apiBaseUrl =
  process.env.API_URL || `http://localhost:3000/api${apiVersion}`;

export const config = {
  locale: 'en-US', // en-US, zh-CN
  ajaxUploadUrl: apiBaseUrl + 'files',
  debug: {
    mock: false, // enable mock
    http: false, // http request log
  },
  api: apiBaseUrl + '/',
  grid: {
    limit: 25,
  },
  format: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm',
  },
};
