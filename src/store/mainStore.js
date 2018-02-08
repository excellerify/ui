import axios from 'axios';

import menu from '../menu';
import config from '../config';
import router from '../router';

const store = {
  state: {
    pageTitle: 'Home',
    menu,
    user: {},
    token: null,
    message: {
      type: null,
      body: null
    },
    config

  },
  mutations: {
    setAuth(state, { user, token, expireTime }) {
      state.user = user;
      state.token = token;
      state.expireTime = expireTime;

      axios.defaults.headers.common.Authorization = token;

      global
        .helper
        .ls
        .set('user', user);
      global
        .helper
        .ls
        .set('token', token);
      global
        .helper
        .ls
        .set('expireTime', expireTime);
    },
    setMenu(state, data) {
      state.menu = data;
    },
    setPageTitle(state, data) {
      state.pageTitle = data;
    },
    showMessage(state, type, body) {
      state.message = {
        type,
        body
      };
    }
  },
  actions: {
    checkAuth({ commit }) {
      const data = {
        user: global
          .helper
          .ls
          .get('user'),
        token: global
          .helper
          .ls
          .get('token'),
        expireTime: global
          .helper
          .ls
          .get('expireTime')
      };

      commit('setAuth', data);
    },
    doLogin({ commit }, params) {
      commit('setAuth', params);
      router.push('/');
    },
    clearAuth({ commit }) {
      commit('setAuth', {
        user: null,
        token: null,
        expireTime: null
      });
      router.push('/login');
    },
    checkPageTitle({ commit, state }, path) {
      for (const k in state.menu) {
        if (state.menu[k].href === path) {
          commit('setPageTitle', state.menu[k].title);
          break;
        }
      }
    }
  }
};

export default store;
