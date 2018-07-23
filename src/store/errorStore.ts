import { StoreOptions } from 'vuex';

export interface IErrorStore {
  globalError?: string;
}

export const errorStore: StoreOptions<IErrorStore> = {
  state: {
    globalError: '',
  },
  getters: {
    getGlobalError: state => state.globalError,
  },
  mutations: {
    setGlobalError(state, errorMessage) {
      state.globalError = errorMessage;
    },
  },
  actions: {},
};
