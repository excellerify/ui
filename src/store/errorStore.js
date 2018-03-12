const store = {
  state: {
    globalError: null,
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

export default store;
