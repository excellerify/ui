import axios from 'axios';

import router from '../router';

const store = {
  state: {
    user: {},
    token: null
  },
  mutations: {
    setAuth(state, { user, token, expireTime }) {
      axios.defaults.headers.common.Authorization = token;

      state.user = user;
      state.token = token;
      state.expireTime = expireTime;

      global.helper.ls.set('user', user);
      global.helper.ls.set('token', token);
      global.helper.ls.set('expireTime', expireTime);
    }
  },
  actions: {
    checkAuth({ commit }) {
      const data = {
        user: global.helper.ls.get('user'),
        token: global.helper.ls.get('token'),
        expireTime: global.helper.ls.get('expireTime')
      };

      commit('setAuth', data);
    },
    login: async ({ commit }, { username, password }) => {
      const response = await global.$http.post('admins/login', {
        username,
        password
      });

      commit('setAuth', {
        user: response.data.userId,
        token: response.data.id,
        expireTime: response.data.ttl
      });

      router.push('/');
    },
    logout: async () => {
      const result = await global.$http.post('admins/logout');

      return result;
    },
    clearAuth({ commit }) {
      commit('setAuth', {
        user: null,
        token: null,
        expireTime: null
      });
      router.push('/login');
    }
  }
};

export default store;
