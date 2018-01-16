const store = {
  state: {
    submitLoading: false,
    submitSuccess: {
      message: null
    },
    submitError: {
      message: null
    }
  },
  mutations: {
    submitLoading(state) {
      state.submitLoading = true;
      state.submitSuccess = {};
      state.submitError = {};
    },
    submitSuccess(state, {message}) {
      state.submitLoading = false;
      state.submitSuccess = {message};
    },
    submitError(state, {message}) {
      state.submitLoading = false;
      state.submitError = {message};
    }
  }
};

export default store;
