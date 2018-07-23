import { IMenu, IMenuItems } from '@/interfaces/menu.interface';
import { StoreOptions } from 'vuex';

export interface IMainStoreState {
  pageTitle: string;
  globalLoading: boolean;
  menu: object[];
  config: object[];
}

export const mainStore: StoreOptions<IMainStoreState> = {
  state: {
    pageTitle: 'Home',
    globalLoading: false,
    menu: [],
    config: [],
  },
  getters: {
    getGlobalLoading: state => {
      return state.globalLoading;
    },
    getPageTitle: state => {
      return state.pageTitle;
    },
  },
  mutations: {
    setMenu(state, data) {
      state.menu = data;
    },
    setPageTitle(state, title: string) {
      state.pageTitle = title;
      document.title = title;
    },
    setGlobalLoading(state, { isLoading }) {
      state.globalLoading = isLoading;
    },
  },
  actions: {
    async checkPageTitle({ commit, state }, { path, action }) {
      return (
        state.menu &&
        state.menu.forEach(
          (k: IMenu): void => {
            if (k.items) {
              k.items.forEach(
                (i: IMenuItems): void => {
                  if (path.indexOf(i.href) !== -1) {
                    const title = `${i.title} ${action || ''}`;

                    commit('setPageTitle', title);
                  }
                },
              );
            } else {
              if (path.indexOf(k.href) !== -1) {
                const title = `${k.title} ${action || ''}`;

                commit('setPageTitle', title);
              }
            }
          },
        )
      );
    },
  },
};
