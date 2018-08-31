import { config } from '@/config';
import { store } from '@/store';
import axios, { AxiosInstance } from 'axios';

export const http: AxiosInstance = axios.create({
  baseURL: config.api,
  timeout: 10000,
  headers: {
    Authorization: JSON.parse(localStorage.getItem('token') || '"anonymous"'),
  },
});

http.interceptors.request.use(
  request => request,
  error =>
    // Do something with request error
    Promise.reject(error),
);

http.interceptors.response.use(
  response => {
    const request = response.config;
    if (config.debug.http) {
      // eslint-disable-next-line
      console.info(
        '>>>',
        request.method && request.method.toUpperCase(),
        request.url,
        request.params,
        '\n   ',
        response.status,
        response.data,
      );
    }
    return response;
  },
  error => {
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

    if (!error.response) {
      // eslint-disable-next-line
      error.response = {
        status: 503,
        data: {
          error: error.message,
        },
      };
    } else if (error.response.status === 401 || error.response.status === 403) {
      store.dispatch('clearAuth');
    }

    store.commit('setGlobalError', error.message);

    return Promise.reject(error);
  },
);
