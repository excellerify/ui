import menu from '../menu';
import config from '../config';

const store = {
  state: {
    pageTitle: 'Home',
    menu,
    config,
    globalLoading: false
  },
  getters: {
    getGlobalLoading: state => state.globalLoading
  },
  mutations: {
    setMenu(state, data) {
      state.menu = data;
    },
    setPageTitle(state, data) {
      state.pageTitle = data;
    },
    setGlobalLoading(state, { isLoading }) {
      state.globalLoading = isLoading;
    }
  },
  actions: {
    async checkPageTitle({ commit, state }, { path, action }) {
      state.menu.forEach(k => {
        if (path.indexOf(k.href) !== -1) {
          const title = `${k.title} ${action || ''}`;

          commit('setPageTitle', title);

          document.title = title;
        }
      });
    }
  }
};

export default store;
