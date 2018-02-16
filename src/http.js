import Vue from 'vue';
import axios from 'axios';
import config from './config';

const http = axios.create({
  baseURL: config.api,
  timeout: 1000,
  // headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});

http.interceptors.request.use(
  request => request,
  error =>
    // Do something with request error
    Promise.reject(error),
);

http.interceptors.response.use(
  (response) => {
    const request = response.config;
    if (config.debug.http) {
      // eslint-disable-next-line
      console.info(
        '>>>',
        request.method.toUpperCase(),
        request.url,
        request.params,
        '\n   ',
        response.status,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    if (config.debug.http) {
      const { response, config: request } = error;
      if (request) {
        // eslint-disable-next-line
        console.info(
          '>>>',
          request.method.toUpperCase(),
          request.url,
          request.params,
          '\n   ',
          response.status,
          response.data,
        );
      }
    }

    if (error.response.status === 401 || error.response.status === 403) {
      global.store.dispatch('clearAuth');
    }

    // Do something with response error
    return Promise.reject(error);
  },
);

Vue.prototype.$http = http;
