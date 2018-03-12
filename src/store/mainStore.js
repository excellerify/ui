import menu from '../menu';
import config from '../config';

const store = {
  state: {
    pageTitle: 'Home',
    menu,
    config,
  },
  mutations: {
    setMenu(state, data) {
      state.menu = data;
    },
    setPageTitle(state, data) {
      state.pageTitle = data;
    },
  },
  actions: {
    async checkPageTitle({ commit, state }, { path, action }) {
      const keys = Object.keys(state.menu);
      keys.forEach(k => {
        if (path.indexOf(state.menu[k].href) !== -1) {
          commit('setPageTitle', `${state.menu[k].title} ${action || ''}`);
        }
      });
    },
  },
};

export default store;
