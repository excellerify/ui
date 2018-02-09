const store = {
  state: {},
  mutations: {},
  actions: {
    // async login(_, { url, params }) {},
    async logout() {
      try {
        const result = await global.$http.post('admins/logout');

        return Promise.resolve(result);
      } catch (e) {
        return Promise.resolve(e);
      }
    }
  }
};

export default store;
