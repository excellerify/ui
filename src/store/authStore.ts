import { helper } from '@/helper';
import { http } from '@/http';
import { router } from '@/router';
import { StoreOptions } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export interface IAuthStore {
  user?: object;
  token?: string;
  expireTime?: string;
}

export const authStore: StoreOptions<IAuthStore> = {
  plugins: [createPersistedState()],
  mutations: {
    setAuth(state, { user, token, expireTime }) {
      http.defaults.headers.Authorization = token;

      state.user = user;
      state.token = token;
      state.expireTime = expireTime;

      helper.ls.set('user', user);
      helper.ls.set('token', token);
      helper.ls.set('expireTime', expireTime);
    },
    clearAuth(state) {
      delete http.defaults.headers.common.Authorization;

      delete state.user;
      delete state.token;
      delete state.expireTime;
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
      const response = await http.post('admin/login', {
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
      const result = await http.post('admin/logout');

      return result;
    },
    clearAuth({ commit }) {
      commit('clearAuth');
      router.push('/login');
    },
  },
};
