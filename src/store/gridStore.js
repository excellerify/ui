const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchGridSchema(_, { resource, filters }) {
      const result = await global.$http.get(`${resource}/grid`, {
        params: { filters }
      });

      return result.data.schema;
    }
  }
};

export default store;
