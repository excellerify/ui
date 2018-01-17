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
      state.submitSuccess = {
        status: false
      };
      state.submitError = {
        status: false
      };
    },
    submitSuccess(state, {message}) {
      state.submitLoading = false;
      state.submitSuccess = {
        status: true,
        message
      };
    },
    submitError(state, {message}) {
      state.submitLoading = false;
      state.submitError = {
        status: true,
        message
      };
    }
  }
};

export default store;
