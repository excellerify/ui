import menu from '../menu';
import config from '../config';

const store = {
  state: {
    pageTitle: 'Home',
    menu,
    message: {
      type: null,
      body: null,
    },
    config,
  },
  mutations: {
    setMenu(state, data) {
      state.menu = data;
    },
    setPageTitle(state, data) {
      state.pageTitle = data;
    },
    showMessage(state, type, body) {
      state.message = {
        type,
        body,
      };
    },
  },
  actions: {
    checkPageTitle({ commit, state }, path) {
      const keys = Object.keys(state.menu);
      keys.forEach((k) => {
        if (state.menu[k].href === path) {
          commit('setPageTitle', state.menu[k].title);
        }
      });
    },
  },
};

export default store;
