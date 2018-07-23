import { helper } from '@/helper';
import { http } from '@/http';
import { router } from '@/router';
import axios from 'axios';
import { StoreOptions } from 'vuex';

export interface IAuthStore {
  user?: object;
  token?: string;
  expireTime?: string;
}

export const authStore: StoreOptions<IAuthStore> = {
  mutations: {
    setAuth(state, { user, token, expireTime }) {
      axios.defaults.headers.common.Authorization = token;

      state.user = user;
      state.token = token;
      state.expireTime = expireTime;

      helper.ls.set('user', user);
      helper.ls.set('token', token);
      helper.ls.set('expireTime', expireTime);
    },
  },
  actions: {
    checkAuth({ commit }) {
      const data = {
        user: helper.ls.get('user'),
        token: helper.ls.get('token'),
        expireTime: helper.ls.get('expireTime'),
      };

      commit('setAuth', data);
    },
    login: async ({ commit }, { username, password }) => {
      const response = await http.post('admins/login', {
        username,
        password,
      });

      commit('setAuth', {
        user: response.data.userId,
        token: response.data.id,
        expireTime: response.data.ttl,
      });

      router.push('/');
    },
    logout: async () => {
      const result = await http.post('admins/logout');

      return result;
    },
    clearAuth({ commit }) {
      commit('setAuth', {
        user: null,
        token: null,
        expireTime: null,
      });
      router.push('/login');
    },
  },
};
